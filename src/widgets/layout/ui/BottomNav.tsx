import { lazy, Suspense, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'

import styles from './BottomNav.module.css'

const DOUBLE_TAP_DELAY = 300

const MascotGame = lazy(() =>
  import('@/features/mascot-game').then((m) => ({ default: m.MascotGame })),
)

function IconCalendar() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="18" height="17" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="M3 9H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 2V5M16 2V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="8" cy="14" r="1.2" fill="currentColor" />
      <circle cx="12" cy="14" r="1.2" fill="currentColor" />
      <circle cx="16" cy="14" r="1.2" fill="currentColor" />
    </svg>
  )
}

function IconGift() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="11" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M3 11H21V14H3V11Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 11V21" stroke="currentColor" strokeWidth="2" />
      <path d="M12 11C12 11 9 11 7.5 9.5C6 8 7 6 8.5 6C10 6 12 9 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 11C12 11 15 11 16.5 9.5C18 8 17 6 15.5 6C14 6 12 9 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}

function IconQr() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
  const [showGame, setShowGame] = useState(false)
  const lastTapRef = useRef(0)

  const handleProfileTap = () => {
    const now = Date.now()
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      lastTapRef.current = 0
      setShowGame(true)
    } else {
      lastTapRef.current = now
    }
  }

  return (
    <>
      <nav className={styles.nav}>
        <div className={styles.menu}>
          <NavLink to="/" end className={({ isActive }) => `${styles.tab} ${isActive ? styles.tabActive : ''}`} aria-label="Главная">
            <IconCalendar />
          </NavLink>

          <NavLink to="/achievements" className={({ isActive }) => `${styles.tab} ${isActive ? styles.tabActive : ''}`} aria-label="Достижения">
            <IconGift />
          </NavLink>

          <NavLink to="/scan" className={({ isActive }) => `${styles.tab} ${isActive ? styles.tabActive : ''}`} aria-label="Сканировать">
            <IconQr />
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) => `${styles.tab} ${isActive ? styles.tabActive : ''}`}
            aria-label="Профиль"
            onClick={handleProfileTap}
          >
            <IconProfile />
          </NavLink>
        </div>
        <div className={styles.safeArea} />
      </nav>

      {showGame && (
        <Suspense fallback={null}>
          <MascotGame onClose={() => setShowGame(false)} />
        </Suspense>
      )}
    </>
  )
}
