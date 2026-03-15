import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useEventTaskById } from '@/entities/event'
import { useCheckInEvent, usePostCheckIn, QrScannerModal } from '@/features/check-in-event'
import type { CheckInEventResult } from '@/features/check-in-event'
import { GiftOverlay } from '@/features/gift-overlay'
import { useImageUrl } from '@/shared/api/image'
import styles from './TaskPage.module.css'


function TaskHero({ fileId }: { fileId: string | null }) {
  const { data: imageUrl } = useImageUrl(fileId)

  return (
    <div
      className={styles.hero}
      style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
    />
  )
}

function CheckInResult({ result }: { result: CheckInEventResult }) {
  if (!result.isSuccess) {
    return (
      <p className={styles.checkInError}>
        {result.message ?? 'Не удалось выполнить задание. Попробуйте ещё раз.'}
      </p>
    )
  }

  return (
    <div className={styles.resultCard}>
      <div className={styles.resultIcon}>✅</div>
      <div>
        <p className={styles.resultTitle}>Задание выполнено!</p>
        <p className={styles.resultPoints}>+{result.pointsEarned} XP</p>
        {result.campaignCompleted && (
          <p className={styles.resultCampaign}>🎉 Событие завершено!</p>
        )}
      </div>
    </div>
  )
}

export function TaskPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, isLoading, isError } = useEventTaskById(id ?? '')

  const [scannerOpen, setScannerOpen] = useState(false)
  const [checkInResult, setCheckInResult] = useState<CheckInEventResult | null>(null)
  const [checkInError, setCheckInError] = useState<string | null>(null)

  const { pendingGift, processCheckIn, closeGift } = usePostCheckIn()
  const { mutateAsync: checkIn, isPending } = useCheckInEvent()

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.skeletonHero} />
        <div className={`container ${styles.content}`}>
          <div className={styles.skeletonTitle} />
          <div className={styles.skeletonMeta} />
          <div className={styles.skeletonBody} />
        </div>
      </div>
    )
  }

  if (isError || !data?.data?.entity) {
    return (
      <div className={`container ${styles.errorPage}`}>
        <p className={styles.error}>Не удалось загрузить задание. Попробуйте позже.</p>
      </div>
    )
  }

  const task = data.data.entity
  const isAlreadyCompleted = task.isCompleted
  const isSuccess = checkInResult?.isSuccess === true
  const showScanButton = !isAlreadyCompleted && !isSuccess && !isPending

  const handleQrScan = async (scannedText: string) => {
    setScannerOpen(false)
    setCheckInError(null)

    let qrCode = scannedText
    try {
      const secret = new URL(scannedText).searchParams.get('secret')
      if (secret) qrCode = secret
    } catch {
      // not a URL — use as-is
    }

    try {
      const response = await checkIn({ campaignEventId: task.id, qrCode })
      const entity = response?.data?.entity
      if (entity) {
        setCheckInResult(entity)
      }
      if (entity?.isSuccess) {
        const campaignId = task.campaignId as string | undefined
        await processCheckIn({ taskId: task.id, campaignId: campaignId ?? null })
      }
    } catch {
      setCheckInError('Не удалось выполнить задание. Попробуйте ещё раз.')
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.heroWrapper}>
        <TaskHero fileId={task.fileId} />
        <div className={styles.heroOverlay} />

        <button className={styles.backButton} onClick={() => navigate(-1)}>
          ←
        </button>

        <div className={`container ${styles.heroContent}`}>
          <span className={styles.xpBadge}>⚡ {task.pointsForCompletions} XP</span>
          <h1 className={styles.title}>{task.name ?? 'Без названия'}</h1>
        </div>
      </div>

      <div className={`container ${styles.content}`}>
        {isAlreadyCompleted && !checkInResult && (
          <div className={styles.resultCard}>
            <div className={styles.resultIcon}>✅</div>
            <div>
              <p className={styles.resultTitle}>Задание уже выполнено!</p>
            </div>
          </div>
        )}

        {task.description && (
          <p className={styles.description}>{task.description}</p>
        )}

        {checkInResult && <CheckInResult result={checkInResult} />}

        {checkInError && (
          <p className={styles.checkInError}>{checkInError}</p>
        )}

        {showScanButton && (
          <button
            className={styles.scanButton}
            onClick={() => setScannerOpen(true)}
          >
            Сканировать QR-код
          </button>
        )}

        {isPending && (
          <button className={styles.scanButton} disabled>
            Проверяем...
          </button>
        )}
      </div>

      {scannerOpen && (
        <QrScannerModal onScan={handleQrScan} onClose={() => setScannerOpen(false)} />
      )}

      {pendingGift && <GiftOverlay gift={pendingGift} onClose={closeGift} />}
    </div>
  )
}
