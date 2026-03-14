import type { ChallengeApiModel } from '../../lib/challenge'
import styles from './ChallengeCard.module.css'

interface ChallengeCardProps {
  challenge: ChallengeApiModel
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' }).format(new Date(iso))
}

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  const eventsCount = challenge.events?.length ?? 0

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.name}>{challenge.name ?? 'Без названия'}</h2>
        <span className={styles.xpBadge}>⚡ {challenge.pointsForCompletions} XP</span>
      </div>

      {challenge.description && <p className={styles.description}>{challenge.description}</p>}

      <div className={styles.footer}>
        <span className={styles.dateBadge}>
          📅 {formatDate(challenge.startDate)}
          {challenge.endDate ? ` — ${formatDate(challenge.endDate)}` : ''}
        </span>
        {eventsCount > 0 && (
          <span className={styles.eventsBadge}>
            🎯 {eventsCount} {eventsCount === 1 ? 'задание' : eventsCount < 5 ? 'задания' : 'заданий'}
          </span>
        )}
      </div>
    </div>
  )
}
