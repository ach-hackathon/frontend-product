import { NavLink } from 'react-router-dom'
import styles from './BottomNav.module.css'

function IconCalendar() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="5" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 3V7M16 3V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="8" cy="15" r="1.2" fill="currentColor" />
      <circle cx="12" cy="15" r="1.2" fill="currentColor" />
      <circle cx="16" cy="15" r="1.2" fill="currentColor" />
    </svg>
  )
}

function IconGift() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="10" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M3 10H21V13H3V10Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 10V21" stroke="currentColor" strokeWidth="2" />
      <path d="M12 10C12 10 9 10 7.5 8.5C6 7 7 5 8.5 5C10 5 12 8 12 10Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 10C12 10 15 10 16.5 8.5C18 7 17 5 15.5 5C14 5 12 8 12 10Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}

function IconQr() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <rect x="5" y="5" width="3" height="3" fill="currentColor" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <rect x="16" y="5" width="3" height="3" fill="currentColor" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <rect x="5" y="16" width="3" height="3" fill="currentColor" />
      <rect x="14" y="14" width="3" height="3" fill="currentColor" />
      <rect x="18" y="14" width="3" height="3" fill="currentColor" />
      <rect x="14" y="18" width="3" height="3" fill="currentColor" />
      <rect x="18" y="18" width="3" height="3" fill="currentColor" />
    </svg>
  )
}

function IconProfile() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M4 20C4 17.2386 7.58172 15 12 15C16.4183 15 20 17.2386 20 20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function BottomNav() {
  return (
    <nav className={styles.nav}>
      <NavLink to="/" end className={({ isActive }) => `${styles.tab} ${isActive ? styles.tabActive : ''}`} aria-label="Главная">
        <span className={styles.iconWrap}>
          <IconCalendar />
        </span>
      </NavLink>

      <NavLink to="/achievements" className={({ isActive }) => `${styles.tab} ${isActive ? styles.tabActive : ''}`} aria-label="Достижения">
        <span className={styles.iconWrap}>
          <IconGift />
        </span>
      </NavLink>

      <NavLink to="/scan" className={({ isActive }) => `${styles.tab} ${isActive ? styles.tabActive : ''}`} aria-label="Сканировать">
        <span className={styles.iconWrap}>
          <IconQr />
        </span>
      </NavLink>

      <NavLink to="/profile" className={({ isActive }) => `${styles.tab} ${isActive ? styles.tabActive : ''}`} aria-label="Профиль">
        <span className={styles.iconWrap}>
          <IconProfile />
        </span>
      </NavLink>
    </nav>
  )
}
