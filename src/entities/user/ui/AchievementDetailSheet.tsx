import { useImageUrl } from '@/shared/api/image'
import { BottomSheet } from '@/shared/ui/BottomSheet'
import type { UserAchievementApiModel } from '../model/types'
import styles from './AchievementDetailSheet.module.css'

interface AchievementDetailSheetProps {
  item: UserAchievementApiModel
  onClose: () => void
}

export function AchievementDetailSheet({ item, onClose }: AchievementDetailSheetProps) {
  const { data: imageUrl } = useImageUrl(item.achievement.fileId)

  return (
    <BottomSheet onClose={onClose}>
      <div className={styles.content}>
        <div className={styles.imageWrap}>
          {imageUrl
            ? <img src={imageUrl} alt={item.achievement.name ?? ''} className={styles.image} />
            : <span className={styles.emoji}>🏅</span>
          }
        </div>
        <p className={styles.label}>Достижение</p>
        <h2 className={styles.name}>{item.achievement.name ?? 'Достижение'}</h2>
        {item.achievement.description && (
          <p className={styles.desc}>{item.achievement.description}</p>
        )}
        <p className={styles.receivedAt}>
          📅 Получено{' '}
          {new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(
            new Date(item.receivedAtUtc),
          )}
        </p>
        <button className={styles.closeBtn} onClick={onClose} type="button">
          Закрыть
        </button>
      </div>
    </BottomSheet>
  )
}
