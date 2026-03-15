import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import type { UserAchievementsResponse, UserInfoResponse } from './types'

export function useCurrentUser() {
  return useQuery({
    queryKey: ['user/info'],
    queryFn: () => apiClient.get<UserInfoResponse>('/user/info'),
    // не кэшировать: identity-критичные данные, всегда свежие
    staleTime: 0,
  })
}

export function useUserAchievements(userId: string) {
  return useQuery({
    queryKey: ['user/achievements', userId],
    queryFn: () => apiClient.get<UserAchievementsResponse>('/userachievement/achievements', { Id: userId }),
    enabled: !!userId,
  })
}
