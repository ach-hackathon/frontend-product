import { BottomSheet } from '@/shared/ui/BottomSheet'
import { QrScannerView } from './QrScannerView'
import styles from './QrScannerModal.module.css'

interface QrScannerModalProps {
  onScan: (code: string) => void
  onClose: () => void
}

export function QrScannerModal({ onScan, onClose }: QrScannerModalProps) {
  return (
    <BottomSheet onClose={onClose}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h2 className={styles.title}>Сканируйте QR-код</h2>
          <button className={styles.closeButton} onClick={onClose}>✕</button>
        </div>
        <QrScannerView onScan={onScan} />
        <p className={styles.hint}>Наведите камеру на QR-код задания</p>
      </div>
    </BottomSheet>
  )
}
