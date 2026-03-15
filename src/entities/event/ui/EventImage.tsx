import { useImageUrl } from '@/shared/api/image'
import styles from './EventImage.module.css'

interface EventImageProps {
  fileId: string
  alt: string
}

export function EventImage({ fileId, alt }: EventImageProps) {
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
