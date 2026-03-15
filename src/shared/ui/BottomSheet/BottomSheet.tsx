import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'
import styles from './BottomSheet.module.css'

interface BottomSheetProps {
  onClose: () => void
  children: ReactNode
}

const CLOSE_THRESHOLD = 80

export function BottomSheet({ onClose, children }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const dragZoneRef = useRef<HTMLDivElement>(null)
  const startYRef = useRef(0)
  const onCloseRef = useRef(onClose)
  useLayoutEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    const zone = dragZoneRef.current
    const sheet = sheetRef.current
    if (!zone || !sheet) return

    const onTouchStart = (e: TouchEvent) => {
      startYRef.current = e.touches[0]?.clientY ?? 0
      sheet.style.transition = 'none'
    }

    const onTouchMove = (e: TouchEvent) => {
      const delta = Math.max(0, (e.touches[0]?.clientY ?? 0) - startYRef.current)
      sheet.style.transform = `translateY(${delta}px)`
    }

    const onTouchEnd = (e: TouchEvent) => {
      const delta = Math.max(0, (e.changedTouches[0]?.clientY ?? 0) - startYRef.current)
      if (delta >= CLOSE_THRESHOLD) {
        sheet.style.transition = 'transform 0.2s ease'
        sheet.style.transform = 'translateY(100%)'
        sheet.addEventListener('transitionend', () => onCloseRef.current(), { once: true })
      } else {
        sheet.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
        sheet.style.transform = 'translateY(0)'
      }
    }

    zone.addEventListener('touchstart', onTouchStart, { passive: true })
    zone.addEventListener('touchmove', onTouchMove, { passive: true })
    zone.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      zone.removeEventListener('touchstart', onTouchStart)
      zone.removeEventListener('touchmove', onTouchMove)
      zone.removeEventListener('touchend', onTouchEnd)
    }
  }, [])

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div ref={sheetRef} className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div ref={dragZoneRef} className={styles.dragZone}>
          <div className={styles.dragHandle} />
        </div>
        {children}
      </div>
    </div>
  )
}
