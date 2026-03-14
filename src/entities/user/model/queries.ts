import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import type { UserInfoResponse } from './types'

export function useCurrentUser() {
  return useQuery({
    queryKey: ['user/info'],
    queryFn: () => apiClient.get<UserInfoResponse>('/user/info'),
  })
}
