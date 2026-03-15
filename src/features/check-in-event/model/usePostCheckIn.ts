import { useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { fetchUserGifts } from '@/entities/gift'
import type { UserGiftApiModel } from '@/entities/gift'

const GIFT_CHECK_DELAY = 1000

interface PostCheckInOptions {
  taskId: string
  campaignId: string | null
}

export function usePostCheckIn() {
  const queryClient = useQueryClient()
  const [pendingGift, setPendingGift] = useState<UserGiftApiModel | null>(null)

  const processCheckIn = useCallback(
    async ({ taskId, campaignId }: PostCheckInOptions): Promise<UserGiftApiModel | null> => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['event-progress'] }),
        queryClient.invalidateQueries({ queryKey: ['event-leaderboard'] }),
        queryClient.invalidateQueries({ queryKey: ['event-task', taskId] }),
      ])

      if (!campaignId) return null

      await new Promise((r) => setTimeout(r, GIFT_CHECK_DELAY))
      try {
        const giftsRes = await fetchUserGifts(campaignId)
        const gifts = giftsRes.data?.items
        if (gifts && gifts.length > 0) {
          const gift = gifts[0] ?? null
          setPendingGift(gift)
          return gift
        }
      } catch {
        // don't block navigation on gift check failure
      }
      return null
    },
    [queryClient],
  )

  const closeGift = useCallback(() => {
    setPendingGift(null)
  }, [])

  return { pendingGift, processCheckIn, closeGift } as const
}
