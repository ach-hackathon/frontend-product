import { useParams, useNavigate } from 'react-router-dom'
import { useChallengeById, ChallengeEventType, ChallengeEventCompletionCondition } from '@/entities/challenge'
import type { ChallengeEventApiModel } from '@/entities/challenge'
import { useImageUrl } from '@/shared/api/image'
import styles from './ChallengePage.module.css'

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(iso),
  )
}

function getConditionLabel(condition: number): string {
  if (condition === ChallengeEventCompletionCondition.ScanQrCode) return '📷 QR-код'
  if (condition === ChallengeEventCompletionCondition.VisitLocation) return '📍 Локация'
  return '❓'
}

function getTypeLabel(type: number): string {
  if (type === ChallengeEventType.Multiple) return '🔁 Многократно'
  return ''
}

function EventStep({ event, index, isLast }: { event: ChallengeEventApiModel; index: number; isLast: boolean }) {
  return (
    <div className={styles.step}>
      <div className={styles.stepTrack}>
        <div className={styles.stepNumber}>{index + 1}</div>
        {!isLast && <div className={styles.stepLine} />}
      </div>
      <div className={styles.stepCard}>
        <div className={styles.stepHeader}>
          <h3 className={styles.stepName}>{event.name ?? 'Без названия'}</h3>
          <span className={styles.stepXp}>⚡ {event.pointsForCompletions} XP</span>
        </div>
        {event.description && <p className={styles.stepDescription}>{event.description}</p>}
        <div className={styles.stepBadges}>
          <span className={styles.conditionBadge}>{getConditionLabel(event.completionCondition)}</span>
          {getTypeLabel(event.type) && (
            <span className={styles.typeBadge}>{getTypeLabel(event.type)}</span>
          )}
        </div>
      </div>
    </div>
  )
}

function ChallengeHero({ fileId }: { fileId: string | null }) {
  const { data: imageUrl } = useImageUrl(fileId)

  return (
    <div
      className={styles.hero}
      style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
    />
  )
}

export function ChallengePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, isLoading, isError } = useChallengeById(id ?? '')

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.skeletonHero} />
        <div className={`container ${styles.content}`}>
          <div className={styles.skeletonTitle} />
          <div className={styles.skeletonMeta} />
          <div className={styles.skeletonSteps}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={styles.skeletonStep} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (isError || !data?.data?.entity) {
    return (
      <div className={`container ${styles.errorPage}`}>
        <p className={styles.error}>Не удалось загрузить челлендж. Попробуйте позже.</p>
      </div>
    )
  }

  const challenge = data.data.entity
  const events = challenge.events ?? []

  return (
    <div className={styles.page}>
      {/* Full-bleed hero */}
      <div className={styles.heroWrapper}>
        <ChallengeHero fileId={challenge.fileId} />
        <div className={styles.heroOverlay} />

        <button className={styles.backButton} onClick={() => navigate(-1)}>
          ←
        </button>

        <div className={`container ${styles.heroContent}`}>
          <span className={styles.xpBadge}>⚡ {challenge.pointsForCompletions} XP</span>
          <h1 className={styles.title}>{challenge.name ?? 'Без названия'}</h1>
        </div>
      </div>

      {/* Page content */}
      <div className={`container ${styles.content}`}>
        {/* Meta bar */}
        <div className={styles.metaBar}>
          <span className={styles.metaChip}>
            📅 {formatDate(challenge.startDate)}
            {challenge.endDate ? ` — ${formatDate(challenge.endDate)}` : ''}
          </span>
          {events.length > 0 && (
            <span className={styles.metaChip}>
              🎯 {events.length} {events.length === 1 ? 'задание' : events.length < 5 ? 'задания' : 'заданий'}
            </span>
          )}
        </div>

        {/* Description */}
        {challenge.description && (
          <p className={styles.description}>{challenge.description}</p>
        )}

        {/* Events */}
        {events.length > 0 && (
          <section className={styles.eventsSection}>
            <h2 className={styles.eventsTitle}>Задания</h2>
            <div className={styles.stepsList}>
              {events.map((event, i) => (
                <EventStep key={event.id} event={event} index={i} isLast={i === events.length - 1} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
