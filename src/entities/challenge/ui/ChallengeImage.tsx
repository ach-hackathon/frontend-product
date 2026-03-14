import { useImageUrl } from '@/shared/api/image'
import styles from './ChallengeImage.module.css'

interface ChallengeImageProps {
  fileId: string
  alt: string
}

export function ChallengeImage({ fileId, alt }: ChallengeImageProps) {
  const { data: url, isLoading, isError } = useImageUrl(fileId)

  if (isLoading) {
    return <div className={styles.skeleton} />
  }

  if (isError || !url) {
    return null
  }

  return (
    <div className={styles.wrapper}>
      <img className={styles.image} src={url} alt={alt} />
    </div>
  )
}
