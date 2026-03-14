import type { ChallengeApiModel } from '../../lib/challenge'
import styles from './ChallengeCard.module.css'

interface ChallengeCardProps {
  challenge: ChallengeApiModel
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(iso),
  )
}

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  const eventsCount = challenge.events?.length ?? 0

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.name}>{challenge.name ?? 'Без названия'}</h2>
        <span className={styles.points}>{challenge.pointsForCompletions} pts</span>
      </div>

      {challenge.description && <p className={styles.description}>{challenge.description}</p>}

      <div className={styles.footer}>
        <span className={styles.dates}>
          {formatDate(challenge.startDate)}
          {challenge.endDate ? ` — ${formatDate(challenge.endDate)}` : ''}
        </span>
        {eventsCount > 0 && (
          <span className={styles.events}>
            {eventsCount} {eventsCount === 1 ? 'событие' : eventsCount < 5 ? 'события' : 'событий'}
          </span>
        )}
      </div>
    </div>
  )
}