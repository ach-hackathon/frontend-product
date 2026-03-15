import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useCheckInEvent, usePostCheckIn } from '@/features/check-in-event'
import { GiftOverlay } from '@/features/gift-overlay'
import styles from './ActionConfirmPage.module.css'

type PageStatus =
  | { step: 'checking' }
  | { step: 'error'; message: string }

export function ActionConfirmPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const actionId = searchParams.get('action')
  const secret = searchParams.get('secret')
  const campaignId = searchParams.get('event')

  const [status, setStatus] = useState<PageStatus>({ step: 'checking' })
  const calledRef = useRef(false)

  const { pendingGift, processCheckIn, closeGift } = usePostCheckIn()
  const { mutateAsync: checkIn } = useCheckInEvent()

  const fallbackPath = campaignId ? `/event/${campaignId}` : '/profile'

  useEffect(() => {
    if (calledRef.current || !actionId) return
    calledRef.current = true

    void (async () => {
      try {
        const response = await checkIn({ campaignEventId: actionId, qrCode: secret ?? null })
        const entity = response?.data?.entity

        if (!entity?.isSuccess) {
          setStatus({ step: 'error', message: entity?.message ?? 'Не удалось выполнить задание' })
          return
        }

        const gift = await processCheckIn({ taskId: actionId, campaignId })

        if (!gift) {
          navigate(fallbackPath, { replace: true })
        }
      } catch {
        setStatus({ step: 'error', message: 'Не удалось выполнить задание' })
      }
    })()
  }, [actionId, secret, campaignId, checkIn, processCheckIn, navigate, fallbackPath])

  function handleGiftClose() {
    closeGift()
    navigate(fallbackPath, { replace: true })
  }

  if (!actionId) {
    return (
      <div className={styles.page}>
        <div className={styles.stateCard}>
          <div className={styles.stateIcon}>❌</div>
          <p className={styles.stateTitle}>Неверная ссылка</p>
          <p className={styles.stateHint}>Отсутствует идентификатор действия</p>
          <button className={styles.retryButton} onClick={() => navigate('/', { replace: true })}>
            На главную
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {status.step === 'checking' && (
        <div className={styles.stateCard}>
          <div className={styles.spinner} />
          <p className={styles.stateTitle}>Выполняем действие...</p>
          <p className={styles.stateHint}>Пожалуйста, подождите</p>
        </div>
      )}

      {status.step === 'error' && (
        <div className={styles.stateCard}>
          <div className={styles.stateIcon}>❌</div>
          <p className={styles.stateTitle}>{status.message}</p>
          <p className={styles.stateHint}>Попробуйте отсканировать QR-код ещё раз</p>
          <button className={styles.retryButton} onClick={() => navigate(fallbackPath, { replace: true })}>
            {campaignId ? 'К событию' : 'На главную'}
          </button>
        </div>
      )}

      {pendingGift && <GiftOverlay gift={pendingGift} onClose={handleGiftClose} />}
    </div>
  )
}
