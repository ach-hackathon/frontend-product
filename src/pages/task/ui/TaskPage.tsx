import { useParams, useNavigate } from 'react-router-dom'
import { useEventTaskById, EventTaskCompletionCondition, EventTaskType } from '@/entities/event'
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

export function TaskPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, isLoading, isError } = useEventTaskById(id ?? '')

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

        {/* QR Code */}
        {task.qrCode && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>QR-код</h2>
            <div className={styles.qrWrapper}>
              <img src={task.qrCode} alt="QR-код задания" className={styles.qrImage} />
            </div>
          </section>
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
    </div>
  )
}
