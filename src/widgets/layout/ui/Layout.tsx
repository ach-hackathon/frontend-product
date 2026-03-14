import { Link, Outlet } from 'react-router-dom'
import { useUser } from '@/entities/user'
import styles from './Layout.module.css'

export function Layout() {
  const user = useUser()

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || 'Аноним'
  const initials = [user.firstName?.[0], user.lastName?.[0]].filter(Boolean).join('').toUpperCase() || '?'

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={`container ${styles.headerInner}`}>
          <Link to="/" className={styles.logo}>Eventigo</Link>

          <Link to="/profile" className={styles.profile} aria-label="Личный кабинет">
            <span className={styles.profileName}>{fullName}</span>
            <div className={styles.avatar}>{initials}</div>
          </Link>
        </div>
      </header>

      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  )
}
