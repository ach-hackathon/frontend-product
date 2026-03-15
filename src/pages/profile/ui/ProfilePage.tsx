import { useNavigate } from 'react-router-dom'
import { useWebHaptics } from 'web-haptics/react'
import { useUser, useUserAchievements } from '@/entities/user'
import type { UserAchievementApiModel } from '@/entities/user'
import { useUserGifts, UserGiftStatus } from '@/entities/gift'
import type { UserGiftApiModel } from '@/entities/gift'
import { useImageUrl } from '@/shared/api/image'
import { removeToken } from '@/shared/lib/token'
import styles from './ProfilePage.module.css'

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(
    new Date(iso),
  )
}

function AchievementCard({ item }: { item: UserAchievementApiModel }) {
  const { data: imageUrl } = useImageUrl(item.achievement.fileId)
  const { trigger } = useWebHaptics()

  return (
    <div className={styles.achievementCard} onClick={() => { void trigger('success') }}>
      <div className={styles.achievementIcon}>
        {imageUrl
          ? <img src={imageUrl} alt={item.achievement.name ?? ''} className={styles.achievementImg} />
          : <span>🏅</span>
        }
      </div>
      <p className={styles.achievementName}>{item.achievement.name ?? 'Достижение'}</p>
      {item.achievement.description && (
        <p className={styles.achievementDesc}>{item.achievement.description}</p>
      )}
      <p className={styles.achievementDate}>{formatDate(item.receivedAtUtc)}</p>
    </div>
  )
}

const GIFT_PAGE_URL = import.meta.env.VITE_GIFT_PAGE_URL as string

function GiftCard({ item, userId }: { item: UserGiftApiModel; userId: string }) {
  const { data: imageUrl } = useImageUrl(item.gift?.fileId ?? null)

  const isPending = item.status === UserGiftStatus.Pending
  const isDone = item.status === UserGiftStatus.Done
  const isCancelled = item.status === UserGiftStatus.Cancelled

  return (
    <div className={styles.giftCard}>
      <div className={styles.giftIcon}>
        {imageUrl
          ? <img src={imageUrl} alt={item.gift?.name ?? ''} className={styles.giftImg} />
          : <span>🎁</span>
        }
      </div>
      <div className={styles.giftInfo}>
        <p className={styles.giftName}>{item.gift?.name ?? 'Подарок'}</p>
        {item.gift?.description && (
          <p className={styles.giftDesc}>{item.gift.description}</p>
        )}
        {isDone && (
          <span className={`${styles.giftStatusBadge} ${styles.giftStatusDone}`}>✅ Выдано</span>
        )}
        {isCancelled && (
          <span className={`${styles.giftStatusBadge} ${styles.giftStatusCancelled}`}>Отменено</span>
        )}
        {isPending && (
          <a
            href={`${GIFT_PAGE_URL}/?userId=${userId}&giftId=${item.gift?.id ?? item.giftId}`}
            className={styles.giftClaimButton}
            target="_blank"
            rel="noopener noreferrer"
          >
            Забрать подарок
          </a>
        )}
      </div>
    </div>
  )
}

export function ProfilePage() {
  const user = useUser()
  const navigate = useNavigate()
  const { data: achievementsData, isLoading: achievementsLoading } = useUserAchievements(user.id)
  const { data: giftsData, isLoading: giftsLoading } = useUserGifts(user.id)

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Аноним'
  const initials = [user.firstName?.[0], user.lastName?.[0]].filter(Boolean).join('').toUpperCase() || '?'
  const achievements = achievementsData?.data?.items ?? []
  const roles = user.roles?.filter((r) => r.name) ?? []
  const allGifts = giftsData?.data?.items ?? []
  const availableGifts = allGifts.filter((g) => g.status === UserGiftStatus.Pending)
  const receivedGifts = allGifts.filter((g) => g.status === UserGiftStatus.Done)
  const cancelledGifts = allGifts.filter((g) => g.status === UserGiftStatus.Cancelled)

  function handleLogout() {
    removeToken()
    navigate('/login', { replace: true })
  }

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.hero}>
        <div className={styles.avatar}>{initials}</div>
        <h1 className={styles.name}>{fullName}</h1>
        {user.email && <p className={styles.email}>{user.email}</p>}
        {roles.length > 0 && (
          <div className={styles.roles}>
            {roles.map((r) => (
              <span key={r.id} className={styles.roleBadge}>{r.name}</span>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>💎</span>
          <span className={styles.statValue}>{user.userPoints?.points ?? 0}</span>
          <span className={styles.statLabel}>Баланс</span>
        </div>
        {user.userPoints && (
          <>
            <div className={styles.statCard}>
              <span className={styles.statIcon}>🏆</span>
              <span className={styles.statValue}>{user.userPoints.level}</span>
              <span className={styles.statLabel}>Уровень</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statIcon}>⚡</span>
              <span className={styles.statValue}>{user.userPoints.experiencePoints}</span>
              <span className={styles.statLabel}>Опыт (XP)</span>
            </div>
          </>
        )}
      </div>

      {/* Info */}
      <div className={styles.info}>
        {user.registrationDate && (
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>В системе с</span>
            <span className={styles.infoValue}>{formatDate(user.registrationDate)}</span>
          </div>
        )}
        {(user.applications?.length ?? 0) > 0 && (
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Приложения</span>
            <span className={styles.infoValue}>{user.applications!.map((a) => a.name).filter(Boolean).join(', ')}</span>
          </div>
        )}
      </div>

      {/* Achievements */}
      <section className={styles.achievementsSection}>
        <h2 className={styles.achievementsTitle}>🏆 Достижения</h2>
        {achievementsLoading ? (
          <div className={styles.achievementsGrid}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={styles.achievementSkeleton} />
            ))}
          </div>
        ) : achievements.length === 0 ? (
          <p className={styles.achievementsEmpty}>Достижений пока нет. Выполняйте задания!</p>
        ) : (
          <div className={styles.achievementsGrid}>
            {achievements.map((item) => (
              <AchievementCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* Gifts */}
      <section className={styles.giftsSection}>
        <h2 className={styles.giftsTitle}>🎁 Подарки</h2>
        {giftsLoading ? (
          <div className={styles.giftsGrid}>
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className={styles.giftSkeleton} />
            ))}
          </div>
        ) : allGifts.length === 0 ? (
          <p className={styles.giftsEmpty}>Подарков пока нет</p>
        ) : (
          <>
            {availableGifts.length > 0 && (
              <>
                <p className={styles.giftsSubtitle}>Доступны для получения</p>
                <div className={styles.giftsGrid}>
                  {availableGifts.map((item) => (
                    <GiftCard key={item.id} item={item} userId={user.id} />
                  ))}
                </div>
              </>
            )}
            {receivedGifts.length > 0 && (
              <>
                <p className={styles.giftsSubtitle}>Полученные</p>
                <div className={styles.giftsGrid}>
                  {receivedGifts.map((item) => (
                    <GiftCard key={item.id} item={item} userId={user.id} />
                  ))}
                </div>
              </>
            )}
            {cancelledGifts.length > 0 && (
              <>
                <p className={styles.giftsSubtitle}>Отменённые</p>
                <div className={styles.giftsGrid}>
                  {cancelledGifts.map((item) => (
                    <GiftCard key={item.id} item={item} userId={user.id} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </section>

      <button className={styles.logoutButton} onClick={handleLogout}>
        Выйти
      </button>
    </div>
  )
}
