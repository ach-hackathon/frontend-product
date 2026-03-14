import { useNavigate } from 'react-router-dom'
import { useWebHaptics } from 'web-haptics/react'
import { useUser, useUserAchievements } from '@/entities/user'
import type { UserAchievementApiModel } from '@/entities/user'
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

export function ProfilePage() {
  const user = useUser()
  const navigate = useNavigate()
  const { data: achievementsData, isLoading: achievementsLoading } = useUserAchievements(user.id)

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Аноним'
  const initials = [user.firstName?.[0], user.lastName?.[0]].filter(Boolean).join('').toUpperCase() || '?'
  const achievements = achievementsData?.data?.items ?? []

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
      </div>

      {user.userPoints && (
        <div className={styles.stats}>
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
          <div className={styles.statCard}>
            <span className={styles.statIcon}>💎</span>
            <span className={styles.statValue}>{user.userPoints.points}</span>
            <span className={styles.statLabel}>Очки</span>
          </div>
        </div>
      )}

      <div className={styles.info}>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>В системе с</span>
          <span className={styles.infoValue}>{formatDate(user.registrationDate)}</span>
        </div>
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

      <button className={styles.logoutButton} onClick={handleLogout}>
        Выйти
      </button>
    </div>
  )
}
