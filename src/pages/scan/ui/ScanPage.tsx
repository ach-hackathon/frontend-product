import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCheckInEvent, usePostCheckIn, QrScannerView } from '@/features/check-in-event'
import type { CheckInEventResult } from '@/features/check-in-event'
import { GiftOverlay } from '@/features/gift-overlay'
import styles from './ScanPage.module.css'

interface ParsedQr {
  campaignEventId: string
  campaignId: string | null
  qrCode: string | null
}

function parseQrUrl(scannedText: string): ParsedQr | null {
  try {
    const url = new URL(scannedText)
    const actionId = url.searchParams.get('action')
    const eventId = url.searchParams.get('event')
    const secret = url.searchParams.get('secret')
    if (actionId && eventId) {
      return { campaignEventId: actionId, campaignId: eventId, qrCode: secret }
    }
  } catch {
    // not a URL
  }
  return null
}

type ScanStatus =
  | { step: 'scanning' }
  | { step: 'checking' }
  | { step: 'success'; result: CheckInEventResult; taskPath: string }
  | { step: 'error'; message: string }

const AUTO_NAVIGATE_DELAY = 1500

function HelpModal({ onClose }: { onClose: () => void }) {
  return (
    <div className={styles.helpBackdrop} onClick={onClose}>
      <div className={styles.helpSheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.helpHandle} />
        <h2 className={styles.helpTitle}>Как использовать сканер?</h2>
        <ul className={styles.helpList}>
          <li className={styles.helpItem}>
            <span className={styles.helpItemIcon}>🎯</span>
            <span>Наведите камеру на QR-код задания на мероприятии</span>
          </li>
          <li className={styles.helpItem}>
            <span className={styles.helpItemIcon}>✅</span>
            <span>QR-код распознается автоматически - нажимать ничего не нужно</span>
          </li>
          <li className={styles.helpItem}>
            <span className={styles.helpItemIcon}>⚡</span>
            <span>После сканирования задание закрывается и вы получаете XP-очки</span>
          </li>
          <li className={styles.helpItem}>
            <span className={styles.helpItemIcon}>🎁</span>
            <span>За некоторые задания можно получить призы - они появятся сразу после сканирования</span>
          </li>
        </ul>
        <button className={styles.helpClose} onClick={onClose} type="button">
          Понятно
        </button>
      </div>
    </div>
  )
}

export function ScanPage() {
  const navigate = useNavigate()
  const [showHelp, setShowHelp] = useState(false)
  const [status, setStatus] = useState<ScanStatus>({ step: 'scanning' })
  const [scanKey, setScanKey] = useState(0)

  const { pendingGift, processCheckIn, closeGift } = usePostCheckIn()
  const { mutateAsync: checkIn } = useCheckInEvent()

  const handleHelpClose = useCallback(() => setShowHelp(false), [])

  function handleCameraError(message: string) {
    setStatus({ step: 'error', message })
  }

  async function handleScan(scannedText: string) {
    const parsed = parseQrUrl(scannedText)
    if (!parsed) {
      setStatus({ step: 'error', message: 'QR-код не распознан. Убедитесь, что это QR-код задания.' })
      return
    }

    setStatus({ step: 'checking' })

    try {
      const response = await checkIn({
        campaignEventId: parsed.campaignEventId,
        qrCode: parsed.qrCode,
      })

      const entity = response?.data?.entity
      if (!entity?.isSuccess) {
        setStatus({ step: 'error', message: entity?.message ?? 'Не удалось выполнить задание' })
        return
      }

      const taskPath = `/task/${parsed.campaignEventId}`
      setStatus({ step: 'success', result: entity, taskPath })

      const gift = await processCheckIn({
        taskId: parsed.campaignEventId,
        campaignId: parsed.campaignId,
      })

      if (!gift) {
        setTimeout(() => {
          navigate(taskPath, { replace: true })
        }, AUTO_NAVIGATE_DELAY)
      }
    } catch {
      setStatus({ step: 'error', message: 'Не удалось выполнить задание. Попробуйте ещё раз.' })
    }
  }

  function handleRescan() {
    setStatus({ step: 'scanning' })
    setScanKey((k) => k + 1)
  }

  function handleGiftClose() {
    closeGift()
    if (status.step === 'success') {
      navigate(status.taskPath, { replace: true })
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Сканер QR</h1>
        <button className={styles.helpButton} aria-label="Помощь" type="button" onClick={() => setShowHelp(true)}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M6 6C6 4.89543 6.89543 4 8 4C9.10457 4 10 4.89543 10 6C10 6.82843 9.49954 7.54167 8.77735 7.8517C8.31291 8.05156 8 8.5 8 9V9.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
          </svg>
        </button>
      </div>

      <div className={styles.scannerFrame}>
        {status.step === 'scanning' && (
          <>
            <QrScannerView key={scanKey} onScan={handleScan} onError={handleCameraError} />
            <div className={styles.scanZone} aria-hidden="true">
              <span className={`${styles.corner} ${styles.cornerTL}`} />
              <span className={`${styles.corner} ${styles.cornerTR}`} />
              <span className={`${styles.corner} ${styles.cornerBL}`} />
              <span className={`${styles.corner} ${styles.cornerBR}`} />
            </div>
          </>
        )}

        {status.step === 'checking' && (
          <div className={styles.stateCard}>
            <div className={styles.spinner} />
            <p className={styles.stateTitle}>Проверяем QR-код...</p>
            <p className={styles.stateHint}>Пожалуйста, подождите</p>
          </div>
        )}

        {status.step === 'success' && (
          <div className={styles.stateCard}>
            <div className={styles.stateIcon}>✅</div>
            <p className={styles.stateTitle}>Задание выполнено!</p>
            {status.result.campaignCompleted && (
              <p className={styles.stateHint}>🎉 Событие завершено!</p>
            )}
          </div>
        )}

        {status.step === 'error' && (
          <div className={styles.stateCard}>
            <div className={styles.stateIcon}>❌</div>
            <p className={styles.stateTitle}>{status.message}</p>
            <button className={styles.retryButton} onClick={handleRescan}>
              Попробовать снова
            </button>
          </div>
        )}
      </div>

      {pendingGift && <GiftOverlay gift={pendingGift} onClose={handleGiftClose} />}
      {showHelp && <HelpModal onClose={handleHelpClose} />}
    </div>
  )
}
