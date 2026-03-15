import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useCheckInEvent } from '@/features/check-in-event'
import { GiftOverlay } from '@/features/gift-overlay'
import { fetchUserGifts } from '@/entities/gift'
import type { UserGiftApiModel } from '@/entities/gift'
import styles from './ActionConfirmPage.module.css'

const GIFT_CHECK_DELAY = 1000

export function ActionConfirmPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const actionId = searchParams.get('action')
  const secret = searchParams.get('secret')
  const campaignId = searchParams.get('event')

  const [businessError, setBusinessError] = useState<string | null>(null)
  const [pendingGift, setPendingGift] = useState<UserGiftApiModel | null>(null)
  const calledRef = useRef(false)

  const { mutate: checkIn, isPending, error: checkInError } = useCheckInEvent({
    onSuccess: (data) => {
      const entity = data?.data?.entity
      if (!entity?.isSuccess) {
        setBusinessError(entity?.message ?? 'Не удалось выполнить задание')
        return
      }

      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ['event-progress'] }),
        queryClient.invalidateQueries({ queryKey: ['event-leaderboard'] }),
        queryClient.invalidateQueries({ queryKey: ['event-task', actionId] }),
      ]).then(async () => {
        if (campaignId) {
          await new Promise((r) => setTimeout(r, GIFT_CHECK_DELAY))
          try {
            const giftsRes = await fetchUserGifts(campaignId)
            const gifts = giftsRes.data?.items
            if (gifts && gifts.length > 0) {
              setPendingGift(gifts[0] ?? null)
              return
            }
          } catch {
            // не блокируем навигацию при ошибке
          }
        }
        navigate(campaignId ? `/event/${campaignId}` : '/profile', { replace: true })
      })
    },
  })

  useEffect(() => {
    if (calledRef.current) return
    if (!actionId) return

    calledRef.current = true
    checkIn({ campaignEventId: actionId, qrCode: secret ?? null })
  }, [actionId, secret, checkIn])

  function handleGiftClose() {
    setPendingGift(null)
    navigate(campaignId ? `/event/${campaignId}` : '/profile', { replace: true })
  }

  const hasError = !actionId || checkInError || businessError

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
      {isPending && !hasError && (
        <div className={styles.stateCard}>
          <div className={styles.spinner} />
          <p className={styles.stateTitle}>Выполняем действие...</p>
          <p className={styles.stateHint}>Пожалуйста, подождите</p>
        </div>
      )}

      {(checkInError || businessError) && (
        <div className={styles.stateCard}>
          <div className={styles.stateIcon}>❌</div>
          <p className={styles.stateTitle}>{businessError ?? 'Не удалось выполнить задание'}</p>
          <p className={styles.stateHint}>Попробуйте отсканировать QR-код ещё раз</p>
          <button className={styles.retryButton} onClick={() => navigate(campaignId ? `/event/${campaignId}` : '/', { replace: true })}>
            {campaignId ? 'Перейти к компании' : 'На главную'}
          </button>
        </div>
      )}

      {pendingGift && <GiftOverlay gift={pendingGift} onClose={handleGiftClose} />}
    </div>
  )
}
