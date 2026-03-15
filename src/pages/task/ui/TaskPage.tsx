import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useEventTaskById } from '@/entities/event'
import { useCheckInEvent, QrScannerModal } from '@/features/check-in-event'
import type { CheckInEventResult } from '@/features/check-in-event'
import { GiftOverlay } from '@/features/gift-overlay'
import { fetchUserGifts } from '@/entities/gift'
import type { UserGiftApiModel } from '@/entities/gift'
import { useImageUrl } from '@/shared/api/image'
import styles from './TaskPage.module.css'

const GIFT_CHECK_DELAY = 3000

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
  const queryClient = useQueryClient()
  const { data, isLoading, isError } = useEventTaskById(id ?? '')
  const [pendingGift, setPendingGift] = useState<UserGiftApiModel | null>(null)

  const { mutate: checkIn, isPending, data: checkInData, error: checkInError } = useCheckInEvent({
    onSuccess: (_response) => {
      void queryClient.invalidateQueries({ queryKey: ['event-progress'] })
      void queryClient.invalidateQueries({ queryKey: ['event-task', id] })
      void queryClient.invalidateQueries({ queryKey: ['event-leaderboard'] })

      const entity = _response?.data?.entity
      if (!entity?.isSuccess) return

      const campaignId = data?.data?.entity?.campaignId
      if (!campaignId) return

      void (async () => {
        await new Promise((r) => setTimeout(r, GIFT_CHECK_DELAY))
        try {
          const giftsRes = await fetchUserGifts(campaignId)
          const gifts = giftsRes.data?.items
          if (gifts && gifts.length > 0) {
            setPendingGift(gifts[0] ?? null)
          }
        } catch {
          // не блокируем UX при ошибке
        }
      })()
    },
  })
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
  const showScanButton = !isAlreadyCompleted && (!checkInResult || !checkInResult.isSuccess)

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

      {pendingGift && <GiftOverlay gift={pendingGift} onClose={() => setPendingGift(null)} />}
    </div>
  )
}
