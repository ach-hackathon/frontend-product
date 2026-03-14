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
  const totalCount = data?.pages[0]?.data?.totalCount ?? 0

  if (isLoading) {
    return (
      <div className={`container ${styles.page}`}>
        <div className={styles.skeleton}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard} />
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
        {totalCount > 0 && <span className={styles.count}>{totalCount}</span>}
      </div>

      {events.length === 0 ? (
        <p className={styles.empty}>Событий пока нет.</p>
      ) : (
        <>
          <div className={styles.grid}>
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          <div ref={sentinelRef} className={styles.sentinel} />

          {isFetchingNextPage && (
            <div className={styles.skeleton}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={styles.skeletonCard} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
