import { useEffect, useLayoutEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import styles from './QrScannerModal.module.css'

interface QrScannerModalProps {
  onScan: (code: string) => void
  onClose: () => void
}

const SCANNER_ID = 'qr-scanner-container'

export function QrScannerModal({ onScan, onClose }: QrScannerModalProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const scannedRef = useRef(false)
  // Stable ref so the scanner effect never needs to restart when the callback changes
  const onScanRef = useRef(onScan)
  useLayoutEffect(() => {
    onScanRef.current = onScan
  })

  useEffect(() => {
    const scanner = new Html5Qrcode(SCANNER_ID)
    scannerRef.current = scanner

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          if (scannedRef.current) return
          scannedRef.current = true
          void scanner.stop().finally(() => {
            onScanRef.current(decodedText)
          })
        },
        undefined,
      )
      .catch(console.error)

    return () => {
      if (scannerRef.current?.isScanning) {
        void scannerRef.current.stop().catch(console.error)
      }
    }
  }, []) // запускается единожды при монтировании

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Сканируйте QR-код</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>
        <div id={SCANNER_ID} className={styles.scanner} />
        <p className={styles.hint}>Наведите камеру на QR-код задания</p>
      </div>
    </div>
  )
}
