import { useParams, useNavigate, Link } from 'react-router-dom'
import { useEventById, EventTaskType, EventTaskCompletionCondition } from '@/entities/event'
import type { EventTaskApiModel } from '@/entities/event'
import { useImageUrl } from '@/shared/api/image'
import styles from './EventPage.module.css'

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(iso),
  )
}

function getConditionLabel(condition: number): string {
  if (condition === EventTaskCompletionCondition.ScanQrCode) return '📷 QR-код'
  if (condition === EventTaskCompletionCondition.VisitLocation) return '📍 Локация'
  return '❓'
}

function getTypeLabel(type: number): string {
  if (type === EventTaskType.Multiple) return '🔁 Многократно'
  return ''
}

function TaskStep({ task, index, isLast }: { task: EventTaskApiModel; index: number; isLast: boolean }) {
  return (
    <div className={styles.step}>
      <div className={styles.stepTrack}>
        <div className={styles.stepNumber}>{index + 1}</div>
        {!isLast && <div className={styles.stepLine} />}
      </div>
      <Link to={`/task/${task.id}`} className={styles.stepCard}>
        <div className={styles.stepHeader}>
          <h3 className={styles.stepName}>{task.name ?? 'Без названия'}</h3>
          <span className={styles.stepXp}>⚡ {task.pointsForCompletions} XP</span>
        </div>
        {task.description && <p className={styles.stepDescription}>{task.description}</p>}
        <div className={styles.stepBadges}>
          <span className={styles.conditionBadge}>{getConditionLabel(task.completionCondition)}</span>
          {getTypeLabel(task.type) && (
            <span className={styles.typeBadge}>{getTypeLabel(task.type)}</span>
          )}
        </div>
      </Link>
    </div>
  )
}

function EventHero({ fileId }: { fileId: string | null }) {
  const { data: imageUrl } = useImageUrl(fileId)

  return (
    <div
      className={styles.hero}
      style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
    />
  )
}

export function EventPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, isLoading, isError } = useEventById(id ?? '')

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
        <p className={styles.error}>Не удалось загрузить событие. Попробуйте позже.</p>
      </div>
    )
  }

  const event = data.data.entity
  const tasks = event.events ?? []

  return (
    <div className={styles.page}>
      {/* Full-bleed hero */}
      <div className={styles.heroWrapper}>
        <EventHero fileId={event.fileId} />
        <div className={styles.heroOverlay} />

        <button className={styles.backButton} onClick={() => navigate(-1)}>
          ←
        </button>

        <div className={`container ${styles.heroContent}`}>
          <span className={styles.xpBadge}>⚡ {event.pointsForCompletions} XP</span>
          <h1 className={styles.title}>{event.name ?? 'Без названия'}</h1>
        </div>
      </div>

      {/* Page content */}
      <div className={`container ${styles.content}`}>
        {/* Meta bar */}
        <div className={styles.metaBar}>
          <span className={styles.metaChip}>
            📅 {formatDate(event.startDate)}
            {event.endDate ? ` — ${formatDate(event.endDate)}` : ''}
          </span>
          {tasks.length > 0 && (
            <span className={styles.metaChip}>
              🎯 {tasks.length} {tasks.length === 1 ? 'задание' : tasks.length < 5 ? 'задания' : 'заданий'}
            </span>
          )}
        </div>

        {/* Description */}
        {event.description && (
          <p className={styles.description}>{event.description}</p>
        )}

        {/* Tasks */}
        {tasks.length > 0 && (
          <section className={styles.eventsSection}>
            <h2 className={styles.eventsTitle}>Задания</h2>
            <div className={styles.stepsList}>
              {tasks.map((task, i) => (
                <TaskStep key={task.id} task={task} index={i} isLast={i === tasks.length - 1} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
