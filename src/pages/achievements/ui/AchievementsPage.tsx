import { useState } from 'react'
import { useUser, useUserAchievements, AchievementBadge, LockedAchievementBadge, AchievementDetailSheet } from '@/entities/user'
import type { UserAchievementApiModel } from '@/entities/user'
import { BottomSheet } from '@/shared/ui/BottomSheet'
import styles from './AchievementsPage.module.css'

const TOTAL_SLOTS = 15


export function AchievementsPage() {
  const user = useUser()
  const { data, isLoading } = useUserAchievements(user.id)
  const achievements = data?.data?.items ?? []
  const [showHelp, setShowHelp] = useState(false)
  const [selected, setSelected] = useState<UserAchievementApiModel | null>(null)

  const totalSlots = Math.max(TOTAL_SLOTS, Math.ceil((achievements.length + 3) / 3) * 3)
  const lockedCount = totalSlots - achievements.length

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
                <span>Достижения — это награды за активное участие в событиях и выполнение заданий</span>
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

      {selected && (
        <AchievementDetailSheet item={selected} onClose={() => setSelected(null)} />
      )}

      {isLoading ? (
        <div className={styles.grid}>
          {Array.from({ length: TOTAL_SLOTS }).map((_, i) => (
            <div key={i} className={styles.skeletonBadge} />
          ))}
        </div>
      ) : (
        <div className={styles.grid}>
          {achievements.map((item) => (
            <AchievementBadge key={item.id} item={item} size={104} onClick={() => setSelected(item)} />
          ))}
          {Array.from({ length: lockedCount }).map((_, i) => (
            <LockedAchievementBadge key={`locked-${i}`} size={104} />
          ))}
        </div>
      )}
    </div>
  )
}
