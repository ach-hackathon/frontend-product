import { NavLink } from 'react-router-dom'
import styles from './BottomNav.module.css'

function IconHome({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3 10.5L12 3L21 10.5V20C21 20.5523 20.5523 21 20 21H15V15H9V21H4C3.44772 21 3 20.5523 3 20V10.5Z"
        stroke="currentColor"
        strokeWidth={active ? '2.2' : '1.8'}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={active ? 'currentColor' : 'none'}
        fillOpacity={active ? '0.12' : '0'}
      />
    </svg>
  )
}

function IconTrophy({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8 21H16M12 17V21M7 4H17V11C17 13.7614 14.7614 16 12 16C9.23858 16 7 13.7614 7 11V4Z"
        stroke="currentColor"
        strokeWidth={active ? '2.2' : '1.8'}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 6H4C4 9 5.5 11 7 11M17 6H20C20 9 18.5 11 17 11"
        stroke="currentColor"
        strokeWidth={active ? '2.2' : '1.8'}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconQr() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="5" y="5" width="3" height="3" fill="currentColor" />
      <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="16" y="5" width="3" height="3" fill="currentColor" />
      <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="5" y="16" width="3" height="3" fill="currentColor" />
      <path d="M14 14H17V17H14V14Z" fill="currentColor" />
      <path d="M17 17H20V20H17V17Z" fill="currentColor" />
      <path d="M14 17H17" stroke="currentColor" strokeWidth="2" />
      <path d="M17 14H20" stroke="currentColor" strokeWidth="2" />
      <path d="M20 17V20" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function IconProfile({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle
        cx="12"
        cy="8"
        r="4"
        stroke="currentColor"
        strokeWidth={active ? '2.2' : '1.8'}
        fill={active ? 'currentColor' : 'none'}
        fillOpacity={active ? '0.12' : '0'}
      />
      <path
        d="M4 20C4 17.2386 7.58172 15 12 15C16.4183 15 20 17.2386 20 20"
        stroke="currentColor"
        strokeWidth={active ? '2.2' : '1.8'}
        strokeLinecap="round"
      />
    </svg>
  )
}

export function BottomNav() {
  return (
    <nav className={styles.nav}>
      <NavLink to="/" end className={({ isActive }) => `${styles.tab} ${isActive ? styles.tabActive : ''}`}>
        {({ isActive }) => (
          <>
            <span className={styles.iconWrap}>
              <IconHome active={isActive} />
            </span>
            <span className={styles.label}>Главная</span>
          </>
        )}
      </NavLink>

      <NavLink to="/achievements" className={({ isActive }) => `${styles.tab} ${isActive ? styles.tabActive : ''}`}>
        {({ isActive }) => (
          <>
            <span className={styles.iconWrap}>
              <IconTrophy active={isActive} />
            </span>
            <span className={styles.label}>Достижения</span>
          </>
        )}
      </NavLink>

      <NavLink to="/scan" className={({ isActive }) => `${styles.scanTab} ${isActive ? styles.scanTabActive : ''}`} aria-label="Сканировать QR-код">
        <span className={styles.scanCircle}>
          <IconQr />
        </span>
      </NavLink>

      <NavLink to="/profile" className={({ isActive }) => `${styles.tab} ${isActive ? styles.tabActive : ''}`}>
        {({ isActive }) => (
          <>
            <span className={styles.iconWrap}>
              <IconProfile active={isActive} />
            </span>
            <span className={styles.label}>Профиль</span>
          </>
        )}
      </NavLink>
    </nav>
  )
}
