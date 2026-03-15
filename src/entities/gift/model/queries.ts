import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import type { UserGiftsResponse } from './types'

export function fetchUserGifts(campaignId: string): Promise<UserGiftsResponse> {
  return apiClient.get<UserGiftsResponse>('/usergift/gifts', {
    CampaignId: campaignId,
  })
}

export function useUserGifts(userId: string) {
  return useQuery({
    queryKey: ['user/gifts', userId],
    queryFn: () => apiClient.get<UserGiftsResponse>('/usergift/gifts'),
    enabled: !!userId,
  })
}

export function useCampaignGifts(campaignId: string) {
  return useQuery({
    queryKey: ['user/gifts', 'campaign', campaignId],
    queryFn: () => fetchUserGifts(campaignId),
    enabled: !!campaignId,
  })
}
