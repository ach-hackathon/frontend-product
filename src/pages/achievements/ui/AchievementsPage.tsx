import { useState } from 'react'
import { useWebHaptics } from 'web-haptics/react'
import { useUser, useUserAchievements } from '@/entities/user'
import type { UserAchievementApiModel } from '@/entities/user'
import { useImageUrl } from '@/shared/api/image'
import { BottomSheet } from '@/shared/ui/BottomSheet'
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
      <div className={styles.achievementBody}>
        <p className={styles.achievementName}>{item.achievement.name ?? 'Достижение'}</p>
        {item.achievement.description && (
          <p className={styles.achievementDesc}>{item.achievement.description}</p>
        )}
        <p className={styles.achievementDate}>📅 {formatDate(item.receivedAtUtc)}</p>
      </div>
    </div>
  )
}

export function AchievementsPage() {
  const user = useUser()
  const { data, isLoading } = useUserAchievements(user.id)
  const achievements = data?.data?.items ?? []
  const [showHelp, setShowHelp] = useState(false)

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Достижения</h1>
        <button className={styles.helpButton} aria-label="Помощь" type="button" onClick={() => setShowHelp(true)}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 6C6 4.89543 6.89543 4 8 4C9.10457 4 10 4.89543 10 6C10 6.82843 9.49954 7.54167 8.77735 7.8517C8.31291 8.05156 8 8.5 8 9V9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
          </svg>
        </button>
      </div>

      {showHelp && (
        <BottomSheet onClose={() => setShowHelp(false)}>
          <div className={styles.helpContent}>
            <h2 className={styles.helpTitle}>Что такое достижения?</h2>
            <ul className={styles.helpList}>
              <li className={styles.helpItem}>
                <span className={styles.helpIcon}>🏆</span>
                <span>Достижения - это награды за активное участие в событиях и выполнение заданий</span>
              </li>
              <li className={styles.helpItem}>
                <span className={styles.helpIcon}>🎯</span>
                <span>Выполняйте задания на событиях, чтобы зарабатывать новые достижения</span>
              </li>
              <li className={styles.helpItem}>
                <span className={styles.helpIcon}>⚡</span>
                <span>Чем больше достижений, тем выше ваш статус среди участников</span>
              </li>
            </ul>
          </div>
        </BottomSheet>
      )}


      {isLoading ? (
        <div className={styles.list}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.skeletonRow} />
          ))}
        </div>
      ) : achievements.length === 0 ? (
        <p className={styles.empty}>Достижений пока нет. Выполняйте задания!</p>
      ) : (
        <div className={styles.list}>
          {achievements.map((item) => (
            <AchievementCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
