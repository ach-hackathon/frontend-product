import { useEffect, useRef } from 'react'
import { EventCard, useEvents } from '@/entities/event'
import styles from './HomePage.module.css'

export function HomePage() {
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useEvents()
  const sentinelRef = useRef<HTMLDivElement>(null)

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

  if (isLoading) {
    return (
      <div className={`container ${styles.page}`}>
        <div className={styles.pageHeader}>
          <h1 className={styles.title}>События</h1>
        </div>
        <div className={styles.list}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.skeletonRow} />
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
        <h1 className={styles.title}>События</h1>
        <button className={styles.helpButton} aria-label="Помощь" type="button">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 6C6 4.89543 6.89543 4 8 4C9.10457 4 10 4.89543 10 6C10 6.82843 9.49954 7.54167 8.77735 7.8517C8.31291 8.05156 8 8.5 8 9V9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
          </svg>
        </button>
      </div>

      {events.length === 0 ? (
        <p className={styles.empty}>Событий пока нет.</p>
      ) : (
        <>
          <div className={styles.list}>
            {events.map((event) => (
              <EventCard key={event.id} event={event} variant="row" />
            ))}
          </div>

          <div ref={sentinelRef} className={styles.sentinel} />

          {isFetchingNextPage && (
            <div className={styles.list}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={styles.skeletonRow} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
