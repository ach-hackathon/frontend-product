import { Link } from 'react-router-dom'
import type { EventApiModel } from '../model/types'
import styles from './EventCard.module.css'

interface EventCardProps {
  event: EventApiModel
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' }).format(new Date(iso))
}

export function EventCard({ event }: EventCardProps) {
  const tasksCount = event.events?.length ?? 0

  return (
    <Link to={`/event/${event.id}`} className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.name}>{event.name ?? 'Без названия'}</h2>
        <span className={styles.xpBadge}>⚡ {event.pointsForCompletions} XP</span>
      </div>

      {event.description && <p className={styles.description}>{event.description}</p>}

      <div className={styles.footer}>
        <span className={styles.dateBadge}>
          📅 {formatDate(event.startDate)}
          {event.endDate ? ` — ${formatDate(event.endDate)}` : ''}
        </span>
        {tasksCount > 0 && (
          <span className={styles.eventsBadge}>
            🎯 {tasksCount} {tasksCount === 1 ? 'задание' : tasksCount < 5 ? 'задания' : 'заданий'}
          </span>
        )}
      </div>
    </Link>
  )
}
