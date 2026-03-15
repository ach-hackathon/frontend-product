import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useCheckInEvent, QrScannerView } from '@/features/check-in-event'
import styles from './ScanPage.module.css'

interface ParsedQr {
  campaignEventId: string
  qrCode: string | null
}

function parseQrUrl(scannedText: string): ParsedQr | null {
  try {
    const url = new URL(scannedText)
    const actionId = url.searchParams.get('action')
    const eventId = url.searchParams.get('event')
    const secret = url.searchParams.get('secret')
    if (actionId && eventId) {
      return { campaignEventId: actionId, qrCode: secret }
    }
  } catch {
    // не URL
  }
  return null
}

export function ScanPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [parseError, setParseError] = useState(false)
  const [businessError, setBusinessError] = useState<string | null>(null)
  const [scanKey, setScanKey] = useState(0)

  const { mutate: checkIn, reset, isPending, error: checkInError } = useCheckInEvent({
    onSuccess: (data, variables) => {
      const entity = data?.data?.entity
      if (!entity?.isSuccess) {
        setBusinessError(entity?.message ?? 'Не удалось выполнить задание')
        return
      }
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ['event-progress'] }),
        queryClient.invalidateQueries({ queryKey: ['event-leaderboard'] }),
        queryClient.invalidateQueries({ queryKey: ['event-task', variables.campaignEventId] }),
      ]).then(() => {
        navigate(`/task/${variables.campaignEventId}`, { replace: true })
      })
    },
  })

  function handleScan(scannedText: string) {
    setParseError(false)
    setBusinessError(null)
    const parsed = parseQrUrl(scannedText)
    if (parsed) {
      checkIn(parsed)
    } else {
      setParseError(true)
    }
  }

  function handleRescan() {
    reset()
    setParseError(false)
    setBusinessError(null)
    setScanKey((k) => k + 1)
  }

  const showScanner = !isPending && !parseError && !checkInError && !businessError

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Сканировать QR</h1>
        <p className={styles.subtitle}>Наведите камеру на QR-код задания</p>
      </div>

      {showScanner && (
        <div className={styles.scannerFrame}>
          <QrScannerView key={scanKey} onScan={handleScan} />
          <div className={styles.overlay} aria-hidden="true">
            <span className={`${styles.corner} ${styles.cornerTL}`} />
            <span className={`${styles.corner} ${styles.cornerTR}`} />
            <span className={`${styles.corner} ${styles.cornerBL}`} />
            <span className={`${styles.corner} ${styles.cornerBR}`} />
            <div className={styles.scanLine} />
          </div>
        </div>
      )}

      {isPending && (
        <div className={styles.stateCard}>
          <div className={styles.spinner} />
          <p className={styles.stateTitle}>Проверяем QR-код...</p>
          <p className={styles.stateHint}>Пожалуйста, подождите</p>
        </div>
      )}

      {(parseError || checkInError || businessError) && (
        <div className={styles.stateCard}>
          <div className={styles.stateIcon}>❌</div>
          <p className={styles.stateTitle}>
            {parseError ? 'QR-код не распознан' : businessError ?? 'Не удалось выполнить задание'}
          </p>
          <p className={styles.stateHint}>
            {parseError
              ? 'Убедитесь, что это QR-код задания'
              : 'Попробуйте отсканировать ещё раз'}
          </p>
          <button className={styles.retryButton} onClick={handleRescan}>
            Попробовать снова
          </button>
        </div>
      )}
    </div>
  )
}
