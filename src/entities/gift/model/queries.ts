import { apiClient } from '@/shared/api/client'
import type { UserGiftsResponse } from './types'

export function fetchUserGifts(campaignId: string): Promise<UserGiftsResponse> {
  return apiClient.get<UserGiftsResponse>('/usergift/gifts', {
    CampaignId: campaignId,
  })
}
