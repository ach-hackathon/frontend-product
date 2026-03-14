import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useEventTaskById } from '@/entities/event'
import { useCheckInEvent, QrScannerModal } from '@/features/check-in-event'
import type { CheckInEventResult } from '@/features/check-in-event'
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
  const { mutate: checkIn, isPending, data: checkInData, error: checkInError } = useCheckInEvent()
  const [scannerOpen, setScannerOpen] = useState(false)

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
  const checkInResult = checkInData?.data?.entity
  const isAlreadyCompleted = task.isCompleted
  const showScanButton = !isAlreadyCompleted && !checkInResult

  const handleQrScan = (scannedText: string) => {
    setScannerOpen(false)
    let qrCode = scannedText
    try {
      const secret = new URL(scannedText).searchParams.get('secret')
      if (secret) qrCode = secret
    } catch {
      // не URL — передаём как есть
    }
    checkIn({ campaignEventId: task.id, qrCode })
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
        {/* Статус выполнения */}
        {isAlreadyCompleted && !checkInResult && (
          <div className={styles.resultCard}>
            <div className={styles.resultIcon}>✅</div>
            <div>
              <p className={styles.resultTitle}>Задание уже выполнено!</p>
            </div>
          </div>
        )}

        {/* Description */}
        {task.description && (
          <p className={styles.description}>{task.description}</p>
        )}

        {/* Check-in result */}
        {checkInResult && <CheckInResult result={checkInResult} />}

        {/* Check-in error */}
        {checkInError && (
          <p className={styles.checkInError}>Не удалось выполнить задание. Попробуйте ещё раз.</p>
        )}

        {/* QR scan action */}
        {showScanButton && (
          <button
            className={styles.scanButton}
            onClick={() => setScannerOpen(true)}
            disabled={isPending}
          >
            {isPending ? 'Проверяем...' : '📷 Сканировать QR-код'}
          </button>
        )}
      </div>

      {scannerOpen && (
        <QrScannerModal onScan={handleQrScan} onClose={() => setScannerOpen(false)} />
      )}
    </div>
  )
}
