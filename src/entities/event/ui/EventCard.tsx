import { Link } from 'react-router-dom'
import { useImageUrl } from '@/shared/api/image'
import { Tag } from '@/shared/ui/Tag'
import type { EventApiModel } from '../model/types'
import styles from './EventCard.module.css'

interface EventCardProps {
  event: EventApiModel
  variant?: 'card' | 'row'
}

function formatDateRange(start: string, end?: string | null): string {
  const fmt = (iso: string) =>
    new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' }).format(new Date(iso))
  return end ? `${fmt(start)} – ${fmt(end)}` : fmt(start)
}

function tasksLabel(count: number): string {
  if (count === 1) return '1 задание'
  if (count < 5) return `${count} задания`
  return `${count} заданий`
}

function IconCalendar() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 7H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M5 2V4M11 2V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function IconChevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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
        <div className={styles.rowTop}>
          <p className={styles.rowName}>{event.name ?? 'Без названия'}</p>
          <div className={styles.rowDate}>
            <IconCalendar />
            <span>{formatDateRange(event.startDate, event.endDate)}</span>
          </div>
        </div>
        <div className={styles.rowBadges}>
          {tasksCount > 0 && (
            <Tag color="blue">{tasksLabel(tasksCount)}</Tag>
          )}
          {(event.pointsForCompletions ?? 0) > 0 && (
            <Tag color="green">+{event.pointsForCompletions} XP</Tag>
          )}
        </div>
      </div>

      <div className={styles.rowArrow}>
        <IconChevron />
      </div>
    </Link>
  )
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
            📅 {formatDateRange(event.startDate, event.endDate)}
          </span>
          {tasksCount > 0 && (
            <span className={styles.tasksBadge}>🎯 {tasksLabel(tasksCount)}</span>
          )}
        </div>
      </div>
    </Link>
  )
}

export function EventCard({ event, variant = 'card' }: EventCardProps) {
  return variant === 'row' ? <RowView event={event} /> : <CardView event={event} />
}
