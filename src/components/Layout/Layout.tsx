import { Outlet } from 'react-router-dom'
import { useUser } from '../../auth'
import styles from './Layout.module.css'

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function Layout() {
  const user = useUser()
  const initials = getInitials(user.displayName)

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={`container ${styles.headerInner}`}>
          <span className={styles.logo}>Eventigo</span>

          <div className={styles.profile}>
            <span className={styles.profileName}>{user.displayName}</span>
            <div className={styles.avatar} aria-label={user.displayName}>
              {initials}
            </div>
          </div>
        </div>
      </header>

      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  )
}