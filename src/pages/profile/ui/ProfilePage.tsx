import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUser, useUserAchievements, AchievementBadge, LockedAchievementBadge, AchievementDetailSheet } from '@/entities/user'
import type { UserAchievementApiModel } from '@/entities/user'
import { useUserGifts, UserGiftStatus } from '@/entities/gift'
import type { UserGiftApiModel } from '@/entities/gift'
import { useImageUrl } from '@/shared/api/image'
import { removeToken } from '@/shared/lib/token'
import styles from './ProfilePage.module.css'

function formatDate(iso: string): string {
  const d = new Date(iso)
  const day = d.getDate()
  const year = d.getFullYear()
  const month = new Intl.DateTimeFormat('ru-RU', { month: 'long' }).format(d)
  return `${day} ${month} ${year}`
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

const PREVIEW_COUNT = 4
const XP_PER_LEVEL = 500

export function ProfilePage() {
  const user = useUser()
  const navigate = useNavigate()
  const [selectedAchievement, setSelectedAchievement] = useState<UserAchievementApiModel | null>(null)
  const { data: achievementsData, isLoading: achievementsLoading } = useUserAchievements(user.id)
  const { data: giftsData, isLoading: giftsLoading } = useUserGifts(user.id)

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Аноним'
  const achievements = achievementsData?.data?.items ?? []
  const previewAchievements = achievements.slice(0, PREVIEW_COUNT)
  const lockedCount = Math.max(0, PREVIEW_COUNT - previewAchievements.length)

  const xp = user.userPoints?.experiencePoints ?? 0
  const level = user.userPoints?.level ?? 1
  const points = user.userPoints?.points ?? 0
  const xpInLevel = xp % XP_PER_LEVEL
  const xpNextLevel = Math.ceil(xp / XP_PER_LEVEL) * XP_PER_LEVEL || XP_PER_LEVEL
  const xpProgress = Math.round((xpInLevel / XP_PER_LEVEL) * 100)

  const allGifts = giftsData?.data?.items ?? []
  const availableGifts = allGifts.filter((g) => g.status === UserGiftStatus.Pending)
  const receivedGifts = allGifts.filter((g) => g.status === UserGiftStatus.Done)
  const cancelledGifts = allGifts.filter((g) => g.status === UserGiftStatus.Cancelled)

  function handleLogout() {
    removeToken()
    navigate('/login', { replace: true })
  }

  return (
    <div className={styles.page}>
      {selectedAchievement && (
        <AchievementDetailSheet item={selectedAchievement} onClose={() => setSelectedAchievement(null)} />
      )}
      {/* ── Hero banner ── */}
      <div className={styles.hero}>
<img src="/hero-mascot.png" alt="" className={styles.mascot} aria-hidden="true" />
      </div>

      {/* ── User info ── */}
      <div className={styles.userInfo}>
        <h1 className={styles.name}>{fullName}</h1>
        {user.email && <p className={styles.email}>{user.email}</p>}
        <span className={styles.onlineBadge}>
          <span className={styles.onlineDot} />
          Онлайн
        </span>
      </div>

      <div className={styles.sections}>
        {/* ── Level card: XP + Stats ── */}
        <div className={styles.levelCard}>
          {user.userPoints && (
            <div className={styles.xpSection}>
              <p className={styles.xpTitle}>До следующего уровня</p>
              <div className={styles.xpSlider}>
                <div className={styles.xpLabels}>
                  <span className={styles.xpCurrent}>{xpInLevel} XP</span>
                  <span className={styles.xpNext}>{xpNextLevel} XP</span>
                </div>
                <div className={styles.xpBar}>
                  <div className={styles.xpFill} style={{ width: `${xpProgress}%` }} />
                </div>
              </div>
            </div>
          )}

          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Уровень</span>
              <div className={styles.statInner}>
                <img src="/icon-level.png" alt="" className={styles.statIcon} aria-hidden="true" />
                <span className={styles.statValue}>{level}</span>
              </div>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Опыт</span>
              <div className={styles.statInner}>
                <img src="/icon-xp.png" alt="" className={styles.statIcon} aria-hidden="true" />
                <span className={styles.statValue}>{xp}</span>
              </div>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Очки</span>
              <div className={styles.statInner}>
                <img src="/icon-points.png" alt="" className={styles.statIcon} aria-hidden="true" />
                <span className={styles.statValue}>{points}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Achievements preview ── */}
        <section className={styles.achievementsSection}>
          <div className={styles.achievementsHeader}>
            <h2 className={styles.achievementsTitle}>Достижения</h2>
            <Link to="/achievements" className={styles.achievementsLink}>
              <span>Все</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 18l6-6-6-6" stroke="#2D58F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
          <div className={styles.achievementsRow}>
            {achievementsLoading
              ? Array.from({ length: PREVIEW_COUNT }).map((_, i) => (
                <div key={i} className={styles.badgeSkeleton} />
              ))
              : (
                <>
                  {previewAchievements.map((item) => (
                    <AchievementBadge key={item.id} item={item} size={80} onClick={() => setSelectedAchievement(item)} />
                  ))}
                  {Array.from({ length: lockedCount }).map((_, i) => (
                    <LockedAchievementBadge key={`locked-${i}`} size={68} />
                  ))}
                </>
              )
            }
          </div>
        </section>

        {/* ── Gifts ── */}
        {(giftsLoading || allGifts.length > 0) && (
          <section className={styles.giftsSection}>
            <h2 className={styles.giftsTitle}>🎁 Подарки</h2>
            {giftsLoading ? (
              <div className={styles.giftsGrid}>
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className={styles.giftSkeleton} />
                ))}
              </div>
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
        )}

        {/* ── Registration date ── */}
        {user.registrationDate && (
          <p className={styles.registrationDate}>
            Зарегистрирован {formatDate(user.registrationDate)}
          </p>
        )}

        {/* ── Logout ── */}
        <button className={styles.logoutButton} onClick={handleLogout}>
          Выйти
        </button>
      </div>
    </div>
  )
}
