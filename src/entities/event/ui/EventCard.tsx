import { Link } from 'react-router-dom'
import { useImageUrl } from '@/shared/api/image'
import type { EventApiModel } from '../model/types'
import styles from './EventCard.module.css'

interface EventCardProps {
  event: EventApiModel
  variant?: 'card' | 'row'
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' }).format(new Date(iso))
}

function tasksLabel(count: number): string {
  if (count === 1) return '1 задание'
  if (count < 5) return `${count} задания`
  return `${count} заданий`
}

function CardView({ event }: { event: EventApiModel }) {
  const { data: imageUrl } = useImageUrl(event.fileId)
  const tasksCount = event.events?.length ?? 0

  return (
    <Link to={`/event/${event.id}`} className={styles.card}>
      <div className={styles.cardImage}>
        {imageUrl
          ? <img src={imageUrl} alt={event.name ?? ''} className={styles.cardImg} />
          : <div className={styles.cardImgPlaceholder} />
        }
        <span className={styles.cardXp}>⚡ {event.pointsForCompletions} XP</span>
      </div>

      <div className={styles.cardBody}>
        <h2 className={styles.cardName}>{event.name ?? 'Без названия'}</h2>
        {event.description && (
          <p className={styles.cardDesc}>{event.description}</p>
        )}
        <div className={styles.cardFooter}>
          <span className={styles.dateBadge}>
            📅 {formatDate(event.startDate)}{event.endDate ? ` — ${formatDate(event.endDate)}` : ''}
          </span>
          {tasksCount > 0 && (
            <span className={styles.tasksBadge}>🎯 {tasksLabel(tasksCount)}</span>
          )}
        </div>
      </div>
    </Link>
  )
}

function RowView({ event }: { event: EventApiModel }) {
  const { data: imageUrl } = useImageUrl(event.fileId)
  const tasksCount = event.events?.length ?? 0

  return (
    <Link to={`/event/${event.id}`} className={styles.row}>
      <div className={styles.rowThumb}>
        {imageUrl
          ? <img src={imageUrl} alt={event.name ?? ''} className={styles.rowThumbImg} />
          : <div className={styles.rowThumbPlaceholder} />
        }
      </div>

      <div className={styles.rowBody}>
        <p className={styles.rowName}>{event.name ?? 'Без названия'}</p>
        <div className={styles.rowMeta}>
          <span className={styles.rowDate}>
            📅 {formatDate(event.startDate)}{event.endDate ? ` — ${formatDate(event.endDate)}` : ''}
          </span>
          {tasksCount > 0 && (
            <span className={styles.rowTasks}>🎯 {tasksLabel(tasksCount)}</span>
          )}
        </div>
      </div>

      <div className={styles.rowRight}>
        <span className={styles.rowXp}>⚡ {event.pointsForCompletions}</span>
        <svg className={styles.rowArrow} width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </Link>
  )
}

export function EventCard({ event, variant = 'card' }: EventCardProps) {
  return variant === 'row' ? <RowView event={event} /> : <CardView event={event} />
}
