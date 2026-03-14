import { useEffect, useRef, useState } from 'react'
import { EventCard, useEvents } from '@/entities/event'
import styles from './HomePage.module.css'

type ViewMode = 'card' | 'row'

const VIEW_KEY = 'events-view-mode'

function IconGrid() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" />
    </svg>
  )
}

function IconList() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="3" rx="1.5" fill="currentColor" />
      <rect x="3" y="10.5" width="18" height="3" rx="1.5" fill="currentColor" />
      <rect x="3" y="16" width="18" height="3" rx="1.5" fill="currentColor" />
    </svg>
  )
}

export function HomePage() {
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useEvents()
  const sentinelRef = useRef<HTMLDivElement>(null)

  const [view, setView] = useState<ViewMode>(() => {
    return (localStorage.getItem(VIEW_KEY) as ViewMode | null) ?? 'card'
  })

  function switchView(next: ViewMode) {
    setView(next)
    localStorage.setItem(VIEW_KEY, next)
  }

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage()
        }
      },
      { threshold: 0.1 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const events = data?.pages.flatMap((p) => p.data?.items ?? []) ?? []
  const totalCount = data?.pages[0]?.data?.totalCount ?? 0

  if (isLoading) {
    return (
      <div className={`container ${styles.page}`}>
        <div className={styles.pageHeader}>
          <h1 className={styles.title}>События</h1>
        </div>
        <div className={view === 'card' ? styles.grid : styles.list}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={view === 'card' ? styles.skeletonCard : styles.skeletonRow} />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className={`container ${styles.page}`}>
        <p className={styles.error}>Не удалось загрузить события. Попробуйте позже.</p>
      </div>
    )
  }

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.pageHeader}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>События</h1>
          {totalCount > 0 && <span className={styles.count}>{totalCount}</span>}
        </div>

        <div className={styles.viewToggle}>
          <button
            className={`${styles.viewBtn} ${view === 'card' ? styles.viewBtnActive : ''}`}
            onClick={() => switchView('card')}
            aria-label="Карточки"
          >
            <IconGrid />
          </button>
          <button
            className={`${styles.viewBtn} ${view === 'row' ? styles.viewBtnActive : ''}`}
            onClick={() => switchView('row')}
            aria-label="Список"
          >
            <IconList />
          </button>
        </div>
      </div>

      {events.length === 0 ? (
        <p className={styles.empty}>Событий пока нет.</p>
      ) : (
        <>
          <div className={view === 'card' ? styles.grid : styles.list}>
            {events.map((event) => (
              <EventCard key={event.id} event={event} variant={view} />
            ))}
          </div>

          <div ref={sentinelRef} className={styles.sentinel} />

          {isFetchingNextPage && (
            <div className={view === 'card' ? styles.grid : styles.list}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={view === 'card' ? styles.skeletonCard : styles.skeletonRow} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
