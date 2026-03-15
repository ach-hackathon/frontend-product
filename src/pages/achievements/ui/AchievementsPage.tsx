import { useWebHaptics } from 'web-haptics/react'
import { useUser, useUserAchievements } from '@/entities/user'
import type { UserAchievementApiModel } from '@/entities/user'
import { useImageUrl } from '@/shared/api/image'
import styles from './AchievementsPage.module.css'

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

export function AchievementsPage() {
  const user = useUser()
  const { data, isLoading } = useUserAchievements(user.id)
  const achievements = data?.data?.items ?? []

  return (
    <div className={`container ${styles.page}`}>
      <h1 className={styles.title}>🏆 Достижения</h1>

      {isLoading ? (
        <div className={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      ) : achievements.length === 0 ? (
        <p className={styles.empty}>Достижений пока нет. Выполняйте задания!</p>
      ) : (
        <div className={styles.grid}>
          {achievements.map((item) => (
            <AchievementCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
