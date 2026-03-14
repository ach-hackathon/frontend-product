import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import styles from './QrScannerView.module.css'

interface QrScannerViewProps {
  onScan: (code: string) => void
}

const SCANNER_ID = 'qr-scanner-view-container'

export function QrScannerView({ onScan }: QrScannerViewProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const scannedRef = useRef(false)
  const onScanRef = useRef(onScan)
  const [isReady, setIsReady] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)

  useLayoutEffect(() => {
    onScanRef.current = onScan
  })

  useEffect(() => {
    scannedRef.current = false
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
      .then(() => setIsReady(true))
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err)
        setCameraError(
          msg.toLowerCase().includes('permission')
            ? 'Нет доступа к камере. Разрешите доступ в настройках браузера.'
            : 'Не удалось запустить камеру. Попробуйте ещё раз.',
        )
      })

    return () => {
      if (scannerRef.current?.isScanning) {
        void scannerRef.current.stop().catch(console.error)
      }
    }
  }, [])

  if (cameraError) {
    return <div className={styles.cameraError}>{cameraError}</div>
  }

  return (
    <div className={styles.wrapper}>
      {!isReady && <div className={styles.skeleton} />}
      <div
        id={SCANNER_ID}
        className={styles.scanner}
        style={isReady ? undefined : { position: 'absolute', opacity: 0, pointerEvents: 'none' }}
      />
    </div>
  )
}
