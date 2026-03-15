import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useEventProgress, useEventLeaderboard, EventTaskCompletionCondition, EventTaskType } from '@/entities/event'
import type { EventProgressTaskApiModel, EventLeaderboardEntryApiModel } from '@/entities/event'
import { useCampaignGifts, UserGiftStatus } from '@/entities/gift'
import type { UserGiftApiModel } from '@/entities/gift'
import { useUser } from '@/entities/user'
import { useImageUrl } from '@/shared/api/image'
import { Tabs } from '@/shared/ui/Tabs'
import type { TabItem } from '@/shared/ui/Tabs'
import styles from './EventPage.module.css'

const GIFT_PAGE_URL = import.meta.env.VITE_GIFT_PAGE_URL as string

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

function GiftCard({ gift, userId }: { gift: UserGiftApiModel; userId: string }) {
  const giftName = gift.gift?.name ?? 'Подарок'
  const isDone = gift.status === UserGiftStatus.Done
  const isPending = gift.status === UserGiftStatus.Pending
  const giftUrl = `${GIFT_PAGE_URL}/?userId=${userId}&giftId=${gift.id}`

  return (
    <div className={`${styles.giftCard} ${isDone ? styles.giftCardDone : ''}`}>
      <div className={styles.giftIcon}>{isDone ? '✅' : '🎁'}</div>
      <div className={styles.giftInfo}>
        <span className={styles.giftName}>{giftName}</span>
        {isDone && <span className={styles.giftStatus}>Подарок выдан</span>}
        {isPending && (
          <a
            href={giftUrl}
            className={styles.giftClaimBtn}
            target="_blank"
            rel="noopener noreferrer"
          >
            🎁 ЗАБРАТЬ ПОДАРОК
          </a>
        )}
      </div>
    </div>
  )
}

function GiftsSection({ campaignId, userId }: { campaignId: string; userId: string }) {
  const { data, isLoading } = useCampaignGifts(campaignId)
  const gifts = data?.data?.items ?? []

  if (isLoading) {
    return (
      <div className={styles.giftsSection}>
        <h3 className={styles.giftsSectionTitle}>🎁 Подарки</h3>
        <div className={styles.skeletonTask} />
      </div>
    )
  }

  if (gifts.length === 0) return null

  const available = gifts.filter((g) => g.status === UserGiftStatus.Pending)
  const received = gifts.filter((g) => g.status === UserGiftStatus.Done)

  return (
    <section className={styles.giftsSection}>
      <h3 className={styles.giftsSectionTitle}>🎁 Подарки</h3>

      {available.length > 0 && (
        <div className={styles.giftsGroup}>
          <span className={styles.giftsGroupLabel}>Доступные</span>
          {available.map((g) => (
            <GiftCard key={g.id} gift={g} userId={userId} />
          ))}
        </div>
      )}

      {received.length > 0 && (
        <div className={styles.giftsGroup}>
          <span className={styles.giftsGroupLabel}>Полученные</span>
          {received.map((g) => (
            <GiftCard key={g.id} gift={g} userId={userId} />
          ))}
        </div>
      )}
    </section>
  )
}

type Tab = 'tasks' | 'leaderboard'

const EVENT_TABS: TabItem<Tab>[] = [
  { value: 'tasks', label: '🎯 Задания' },
  { value: 'leaderboard', label: '🏆 Лидерборд' },
]

export function EventPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useUser()
  const [activeTab, setActiveTab] = useState<Tab>('tasks')
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

        {/* Gifts */}
        <GiftsSection campaignId={id ?? ''} userId={user.id} />

        {/* Tabs */}
        <Tabs tabs={EVENT_TABS} active={activeTab} onChange={setActiveTab} />

        {/* Tasks tab */}
        {activeTab === 'tasks' && (
          <section className={styles.tasksSection}>
            {tasks.length === 0 ? (
              <p className={styles.lbEmpty}>Заданий пока нет</p>
            ) : (
              <div className={styles.tasksList}>
                {tasks.map((task) => (
                  <TaskRow key={task.id} task={task} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Leaderboard tab */}
        {activeTab === 'leaderboard' && (
          <section className={styles.tasksSection}>
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
        )}
      </div>
    </div>
  )
}
