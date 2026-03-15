import { useCallback, useEffect, useRef } from 'react'

import { GameEngine } from '../lib/game-engine'
import styles from './MascotGame.module.css'

interface MascotGameProps {
  onClose: () => void
}

export function MascotGame({ onClose }: MascotGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<GameEngine | null>(null)

  const handleInteraction = useCallback(() => {
    const engine = engineRef.current
    if (!engine) return

    if (engine.getState() === 'gameover') {
      engine.reset()
      return
    }

    engine.jump()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const onStateChange = () => {
      /* state tracked internally by engine */
    }

    const engine = new GameEngine(canvas, onStateChange)
    engineRef.current = engine

    engine.resize()
    engine.loadMascot('/mascot.png').then(() => {
      engine.start()
    }).catch(() => {
      engine.start()
    })

    const handleResize = () => engine.resize()
    window.addEventListener('resize', handleResize)

    return () => {
      engine.stop()
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault()
        handleInteraction()
      }
      if (e.code === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleInteraction, onClose])

  return (
    <div className={styles.overlay}>
      <button
        className={styles.closeBtn}
        onClick={onClose}
        type="button"
        aria-label="Close game"
      >
        &times;
      </button>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        onClick={handleInteraction}
        onTouchStart={(e) => {
          e.preventDefault()
          handleInteraction()
        }}
      />
    </div>
  )
}
