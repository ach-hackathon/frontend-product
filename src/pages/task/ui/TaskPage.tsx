import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useEventTaskById, EventTaskCompletionCondition, EventTaskType } from '@/entities/event'
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
  const achievements = task.achievements ?? []
  const gifts = task.gifts ?? []
  const checkInResult = checkInData?.data?.entity
  // Single-задание скрываем кнопку после успешного выполнения;
  // Multiple — можно сканировать снова
  const isMultiple = task.type === EventTaskType.Multiple
  const showScanButton = !checkInResult || isMultiple

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
        {/* Badges */}
        <div className={styles.badgeRow}>
          {task.completionCondition === EventTaskCompletionCondition.ScanQrCode && (
            <span className={styles.conditionBadge}>📷 QR-код</span>
          )}
          {task.completionCondition === EventTaskCompletionCondition.VisitLocation && (
            <span className={styles.conditionBadge}>📍 Локация</span>
          )}
          {task.type === EventTaskType.Multiple && (
            <span className={styles.typeBadge}>🔁 Многократно</span>
          )}
        </div>

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
        {task.completionCondition === EventTaskCompletionCondition.ScanQrCode && showScanButton && (
          <button
            className={styles.scanButton}
            onClick={() => setScannerOpen(true)}
            disabled={isPending}
          >
            {isPending ? 'Проверяем...' : '📷 Сканировать QR-код'}
          </button>
        )}

        {/* Location */}
        {task.latitude != null && task.longitude != null && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>📍 Местоположение</h2>
            <p className={styles.locationText}>
              {task.latitude.toFixed(6)}, {task.longitude.toFixed(6)}
            </p>
          </section>
        )}

        {/* Achievements */}
        {achievements.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>🏆 Достижения</h2>
            <div className={styles.rewardList}>
              {achievements.map((a) => (
                <div key={a.id} className={styles.rewardCard}>
                  <span className={styles.rewardIcon}>🏅</span>
                  <div>
                    <p className={styles.rewardName}>{a.name ?? 'Достижение'}</p>
                    {a.description && <p className={styles.rewardDesc}>{a.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Gifts */}
        {gifts.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>🎁 Призы</h2>
            <div className={styles.rewardList}>
              {gifts.map((g) => (
                <div key={g.id} className={styles.rewardCard}>
                  <span className={styles.rewardIcon}>🎁</span>
                  <div>
                    <p className={styles.rewardName}>{g.name ?? 'Приз'}</p>
                    {g.description && <p className={styles.rewardDesc}>{g.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {scannerOpen && (
        <QrScannerModal onScan={handleQrScan} onClose={() => setScannerOpen(false)} />
      )}
    </div>
  )
}
