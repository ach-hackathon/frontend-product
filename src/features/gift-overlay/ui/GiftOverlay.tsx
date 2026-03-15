import type { UserGiftApiModel } from '@/entities/gift'
import styles from './GiftOverlay.module.css'

const GIFT_PAGE_URL = import.meta.env.VITE_GIFT_PAGE_URL as string

interface GiftOverlayProps {
  gift: UserGiftApiModel
  onClose: () => void
}

export function GiftOverlay({ gift, onClose }: GiftOverlayProps) {
  const giftUrl = `${GIFT_PAGE_URL}/?userId=${gift.userId}&giftId=${gift.id}`
  const giftName = gift.gift?.name ?? 'Подарок'

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <div className={styles.confetti}>
          <span>🎉</span>
          <span>✨</span>
          <span>🎊</span>
          <span>⭐</span>
          <span>🎁</span>
        </div>

        <div className={styles.iconWrap}>🎁</div>

        <h2 className={styles.title}>Вам доступен подарок!</h2>
        <p className={styles.description}>
          Поздравляем! Вы получили{' '}
          <span className={styles.giftName}>{giftName}</span>
        </p>

        <a href={giftUrl} className={styles.claimButton} target="_blank" rel="noopener noreferrer">
          🎁 Забрать подарок
        </a>

        <button className={styles.closeButton} onClick={onClose}>
          Позже
        </button>
      </div>
    </div>
  )
}
