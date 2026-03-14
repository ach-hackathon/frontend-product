import { Navigate, useLocation } from 'react-router-dom'
import { Panel } from '@/shared/ui/Panel'
import styles from './CodeSentPage.module.css'

interface CodeSentState {
  email: string
  message: string
}

export function CodeSentPage() {
  const location = useLocation()
  const state = location.state as CodeSentState | null

  if (!state?.email) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className={styles.page}>
      <Panel className={styles.panel}>
        <h1 className={styles.title}>Check your email</h1>
        <p className={styles.message}>{state.message}</p>
        <p className={styles.email}>{state.email}</p>
      </Panel>
    </div>
  )
}
