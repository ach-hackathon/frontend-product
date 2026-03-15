import { useState } from 'react'
import { useWebHaptics } from 'web-haptics/react'
import { useImageUrl } from '@/shared/api/image'
import type { UserAchievementApiModel } from '../model/types'
import styles from './AchievementBadge.module.css'

interface AchievementBadgeProps {
  item: UserAchievementApiModel
  size?: number
  onClick?: () => void
}

export function AchievementBadge({ item, size = 104, onClick }: AchievementBadgeProps) {
  const { data: imageUrl } = useImageUrl(item.achievement.fileId)
  const { trigger } = useWebHaptics()

  function handleClick() {
    void trigger('success')
    onClick?.()
  }

  return (
    <button
      className={styles.badge}
      style={{ width: size, height: size }}
      onClick={handleClick}
      type="button"
      aria-label={item.achievement.name ?? 'Достижение'}
    >
      {imageUrl
        ? <img src={imageUrl} alt={item.achievement.name ?? ''} className={styles.img} />
        : <span className={styles.emoji}>🏅</span>
      }
    </button>
  )
}

interface LockedAchievementBadgeProps {
  size?: number
}

export function LockedAchievementBadge({ size = 104 }: LockedAchievementBadgeProps) {
  const [shaking, setShaking] = useState(false)
  const { trigger } = useWebHaptics()

  function handleClick() {
    if (shaking) return
    void trigger('error')
    setShaking(true)
  }

  return (
    <button
      type="button"
      className={`${styles.locked} ${shaking ? styles.shake : ''}`}
      style={{ width: size, height: size }}
      onClick={handleClick}
      onAnimationEnd={() => setShaking(false)}
      aria-label="Достижение недоступно"
    >
      <img src="/icon-achievement-locked.png" alt="" aria-hidden="true" className={styles.lockedImg} />
    </button>
  )
}
