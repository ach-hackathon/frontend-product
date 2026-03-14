import { type ReactNode } from 'react'
import clsx from 'clsx'
import styles from './Panel.module.css'

interface PanelProps {
  children: ReactNode
  className?: string
}

export function Panel({ children, className }: PanelProps) {
  return <div className={clsx(styles.panel, className)}>{children}</div>
}
