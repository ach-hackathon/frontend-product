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
    <div className={`container ${styles.page}`}>
      <h1 className={styles.title}>Сканер QR-кода</h1>

      {showScanner && (
        <>
          <QrScannerView key={scanKey} onScan={handleScan} />
          <p className={styles.hint}>Наведите камеру на QR-код задания</p>
        </>
      )}

      {isPending && (
        <div className={styles.pending}>
          <div className={styles.pendingSpinner} />
          <p className={styles.pendingText}>Проверяем QR-код...</p>
        </div>
      )}

      {(parseError || checkInError || businessError) && (
        <div className={styles.errorCard}>
          <div className={styles.resultIcon}>❌</div>
          <p className={styles.resultTitle}>
            {parseError
              ? 'QR-код не распознан'
              : businessError ?? 'Не удалось выполнить задание'}
          </p>
          <button className={styles.rescanButton} onClick={handleRescan}>
            Попробовать снова
          </button>
        </div>
      )}
    </div>
  )
}
