import styles from './Tag.module.css'

interface TagProps {
  children: React.ReactNode
  color: 'blue' | 'green'
}

export function Tag({ children, color }: TagProps) {
  return (
    <span className={`${styles.tag} ${styles[color]}`}>
      {children}
    </span>
  )
}
