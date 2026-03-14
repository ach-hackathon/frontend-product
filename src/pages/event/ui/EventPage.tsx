import { useParams, useNavigate, Link } from 'react-router-dom'
import { useEventProgress, useEventLeaderboard, EventTaskCompletionCondition, EventTaskType } from '@/entities/event'
import type { EventProgressTaskApiModel, EventLeaderboardEntryApiModel } from '@/entities/event'
import { useUser } from '@/entities/user'
import { useImageUrl } from '@/shared/api/image'
import styles from './EventPage.module.css'

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(iso),
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

function TaskRow({ task }: { task: EventProgressTaskApiModel }) {
  const conditionIcon =
    task.completionCondition === EventTaskCompletionCondition.ScanQrCode ? '📷' : '📍'
  const isMultiple = task.type === EventTaskType.Multiple

  return (
    <Link to={`/task/${task.id}`} className={`${styles.taskRow} ${task.isCompleted ? styles.taskRowCompleted : ''}`}>
      <div className={`${styles.taskStatus} ${task.isCompleted ? styles.taskStatusDone : ''}`}>
        {task.isCompleted ? '✓' : ''}
      </div>
      <div className={styles.taskInfo}>
        <span className={styles.taskName}>{task.name ?? 'Без названия'}</span>
        <div className={styles.taskMeta}>
          <span className={styles.taskBadge}>{conditionIcon}</span>
          {isMultiple && <span className={styles.taskBadge}>🔁</span>}
          <span className={styles.taskXp}>⚡ {task.pointsForCompletions} XP</span>
        </div>
      </div>
      <span className={styles.taskArrow}>›</span>
    </Link>
  )
}

const RANK_MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

function LeaderboardRow({
  entry,
  rank,
  isCurrentUser,
}: {
  entry: EventLeaderboardEntryApiModel
  rank: number
  isCurrentUser: boolean
}) {
  const name = [entry.firstName, entry.lastName].filter(Boolean).join(' ') || 'Участник'
  const medal = RANK_MEDALS[rank]

  return (
    <div className={`${styles.lbRow} ${isCurrentUser ? styles.lbRowCurrent : ''}`}>
      <span className={styles.lbRank}>{medal ?? rank}</span>
      <span className={styles.lbName}>{name}{isCurrentUser && ' (вы)'}</span>
      <span className={styles.lbPoints}>⚡ {entry.points}</span>
    </div>
  )
}

export function EventPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useUser()
  const { data, isLoading, isError } = useEventProgress(id ?? '', user.id)
  const { data: lbData, isLoading: lbLoading } = useEventLeaderboard(id ?? '')

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.skeletonHero} />
        <div className={`container ${styles.content}`}>
          <div className={styles.skeletonTitle} />
          <div className={styles.skeletonProgress} />
          <div className={styles.skeletonTasks}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={styles.skeletonTask} />
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

  const { campaign, progressPercent, events } = data.data.entity
  const tasks = events ?? []
  const pct = Math.round(progressPercent)
  const completedCount = tasks.filter((t) => t.isCompleted).length
  const leaderboard = lbData?.data?.items ?? []

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.heroWrapper}>
        <EventHero fileId={campaign.fileId} />
        <div className={styles.heroOverlay} />
        <button className={styles.backButton} onClick={() => navigate(-1)}>←</button>
        <div className={`container ${styles.heroContent}`}>
          <span className={styles.xpBadge}>⚡ {campaign.pointsForCompletions} XP</span>
          <h1 className={styles.title}>{campaign.name ?? 'Без названия'}</h1>
        </div>
      </div>

      <div className={`container ${styles.content}`}>
        {/* Meta */}
        <div className={styles.metaBar}>
          <span className={styles.metaChip}>
            📅 {formatDate(campaign.startDate)}
            {campaign.endDate ? ` — ${formatDate(campaign.endDate)}` : ''}
          </span>
          {tasks.length > 0 && (
            <span className={styles.metaChip}>
              🎯 {completedCount} / {tasks.length}
            </span>
          )}
        </div>

        {/* Description */}
        {campaign.description && (
          <p className={styles.description}>{campaign.description}</p>
        )}

        {/* Progress */}
        {tasks.length > 0 && (
          <div className={styles.progressCard}>
            <div className={styles.progressHeader}>
              <span className={styles.progressLabel}>Прогресс</span>
              <span className={styles.progressPct}>{pct}%</span>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}

        {/* Tasks */}
        {tasks.length > 0 && (
          <section className={styles.tasksSection}>
            <h2 className={styles.sectionTitle}>Задания</h2>
            <div className={styles.tasksList}>
              {tasks.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </div>
          </section>
        )}

        {/* Leaderboard */}
        <section className={styles.tasksSection}>
          <h2 className={styles.sectionTitle}>🏆 Лидерборд</h2>
          {lbLoading ? (
            <div className={styles.lbSkeleton}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={styles.lbSkeletonRow} />
              ))}
            </div>
          ) : leaderboard.length === 0 ? (
            <p className={styles.lbEmpty}>Пока никто не набрал очки</p>
          ) : (
            <div className={styles.lbList}>
              {leaderboard.map((entry, i) => (
                <LeaderboardRow
                  key={entry.id}
                  entry={entry}
                  rank={i + 1}
                  isCurrentUser={entry.id === user.id}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
