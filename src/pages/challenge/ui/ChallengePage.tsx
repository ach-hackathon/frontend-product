import { useParams, useNavigate } from 'react-router-dom'
import { useChallengeById, ChallengeEventType, ChallengeEventCompletionCondition } from '@/entities/challenge'
import type { ChallengeEventApiModel } from '@/entities/challenge'
import styles from './ChallengePage.module.css'

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(
    new Date(iso),
  )
}

function getConditionLabel(condition: number): string {
  if (condition === ChallengeEventCompletionCondition.ScanQrCode) return '📷 QR-код'
  if (condition === ChallengeEventCompletionCondition.VisitLocation) return '📍 Локация'
  return '❓ Неизвестно'
}

function getTypeLabel(type: number): string {
  if (type === ChallengeEventType.Single) return 'Однократно'
  if (type === ChallengeEventType.Multiple) return 'Многократно'
  return ''
}

function EventCard({ event }: { event: ChallengeEventApiModel }) {
  return (
    <div className={styles.eventCard}>
      <div className={styles.eventHeader}>
        <h3 className={styles.eventName}>{event.name ?? 'Без названия'}</h3>
        <span className={styles.eventXp}>⚡ {event.pointsForCompletions} XP</span>
      </div>
      {event.description && <p className={styles.eventDescription}>{event.description}</p>}
      <div className={styles.eventBadges}>
        <span className={styles.conditionBadge}>{getConditionLabel(event.completionCondition)}</span>
        {getTypeLabel(event.type) && (
          <span className={styles.typeBadge}>{getTypeLabel(event.type)}</span>
        )}
      </div>
    </div>
  )
}

export function ChallengePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, isLoading, isError } = useChallengeById(id ?? '')

  if (isLoading) {
    return (
      <div className={`container ${styles.page}`}>
        <div className={styles.skeleton}>
          <div className={styles.skeletonHero} />
          <div className={styles.skeletonEvents}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={styles.skeletonEvent} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (isError || !data?.data?.entity) {
    return (
      <div className={`container ${styles.page}`}>
        <p className={styles.error}>Не удалось загрузить челлендж. Попробуйте позже.</p>
      </div>
    )
  }

  const challenge = data.data.entity
  const events = challenge.events ?? []

  return (
    <div className={`container ${styles.page}`}>
      <button className={styles.backButton} onClick={() => navigate(-1)}>
        ← Назад
      </button>

      <div className={styles.hero}>
        <div className={styles.heroHeader}>
          <h1 className={styles.title}>{challenge.name ?? 'Без названия'}</h1>
          <span className={styles.xpBadge}>⚡ {challenge.pointsForCompletions} XP</span>
        </div>

        {challenge.description && <p className={styles.description}>{challenge.description}</p>}

        <div className={styles.dates}>
          <span className={styles.dateBadge}>
            📅 {formatDate(challenge.startDate)}
            {challenge.endDate ? ` — ${formatDate(challenge.endDate)}` : ''}
          </span>
          {events.length > 0 && (
            <span className={styles.eventsBadge}>
              🎯 {events.length} {events.length === 1 ? 'задание' : events.length < 5 ? 'задания' : 'заданий'}
            </span>
          )}
        </div>
      </div>

      {events.length > 0 && (
        <section className={styles.eventsSection}>
          <h2 className={styles.eventsTitle}>Задания</h2>
          <div className={styles.eventsList}>
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
