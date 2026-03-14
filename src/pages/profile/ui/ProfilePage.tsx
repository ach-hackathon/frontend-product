import { useNavigate } from 'react-router-dom'
import { useUser } from '@/entities/user'
import { removeToken } from '@/shared/lib/token'
import styles from './ProfilePage.module.css'

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(
    new Date(iso),
  )
}

export function ProfilePage() {
  const user = useUser()
  const navigate = useNavigate()

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Аноним'
  const initials = [user.firstName?.[0], user.lastName?.[0]].filter(Boolean).join('').toUpperCase() || '?'

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

      <button className={styles.logoutButton} onClick={handleLogout}>
        Выйти
      </button>
    </div>
  )
}
