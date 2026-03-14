import { ChallengeCard } from '../components/ChallengeCard/ChallengeCard'
import { useChallenges } from '../lib/challenge'
import styles from './HomePage.module.css'

export function HomePage() {
  const { data, isLoading, isError } = useChallenges()

  const challenges = data?.data?.items ?? []
  const totalCount = data?.data?.totalCount ?? 0

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
        <p className={styles.error}>Не удалось загрузить челленджи. Попробуйте позже.</p>
      </div>
    )
  }

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Челленджи</h1>
        {totalCount > 0 && <span className={styles.count}>{totalCount}</span>}
      </div>

      {challenges.length === 0 ? (
        <p className={styles.empty}>Челленджей пока нет.</p>
      ) : (
        <div className={styles.grid}>
          {challenges.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      )}
    </div>
  )
}