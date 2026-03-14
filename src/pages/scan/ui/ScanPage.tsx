import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useCheckInEvent, QrScannerView } from '@/features/check-in-event'
import type { CheckInEventResult } from '@/features/check-in-event'
import styles from './ScanPage.module.css'

function parseQrUrl(scannedText: string): { campaignEventId: string; qrCode: string } | null {
  try {
    const url = new URL(scannedText)
    const secret = url.searchParams.get('secret')
    const taskMatch = url.pathname.match(/\/task\/([^/]+)/)
    if (taskMatch?.[1] && secret) {
      return { campaignEventId: taskMatch[1], qrCode: secret }
    }
  } catch {
    // не URL
  }
  return null
}

export function ScanPage() {
  const queryClient = useQueryClient()
  const [result, setResult] = useState<CheckInEventResult | null>(null)
  const [parseError, setParseError] = useState(false)
  const [scanKey, setScanKey] = useState(0)

  const { mutate: checkIn, isPending, error: checkInError } = useCheckInEvent({
    onSuccess: (data) => {
      const entity = data?.data?.entity
      if (entity) {
        setResult(entity)
        void queryClient.invalidateQueries({ queryKey: ['event-progress'] })
      }
    },
  })

  function handleScan(scannedText: string) {
    setResult(null)
    setParseError(false)
    const parsed = parseQrUrl(scannedText)
    if (parsed) {
      checkIn(parsed)
    } else {
      setParseError(true)
    }
  }

  function handleRescan() {
    setResult(null)
    setParseError(false)
    setScanKey((k) => k + 1)
  }

  const showScanner = !result && !isPending && !parseError && !checkInError

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

      {result && (
        <div className={styles.resultCard}>
          <div className={styles.resultIcon}>✅</div>
          <p className={styles.resultTitle}>Задание выполнено!</p>
          <p className={styles.resultPoints}>+{result.pointsEarned} XP</p>
          {result.campaignCompleted && (
            <p className={styles.resultBadge}>🎉 Событие завершено!</p>
          )}
          <button className={styles.rescanButton} onClick={handleRescan}>
            Сканировать ещё
          </button>
        </div>
      )}

      {(parseError || checkInError) && (
        <div className={styles.errorCard}>
          <div className={styles.resultIcon}>❌</div>
          <p className={styles.resultTitle}>
            {parseError ? 'QR-код не распознан' : 'Не удалось выполнить задание'}
          </p>
          <button className={styles.rescanButton} onClick={handleRescan}>
            Попробовать снова
          </button>
        </div>
      )}
    </div>
  )
}
