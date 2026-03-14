import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import type { ChallengeInfoResponse, ChallengeListResponse } from './types'

const PAGE_SIZE = 9

export function useChallenges() {
  return useInfiniteQuery({
    queryKey: ['challenges'],
    queryFn: ({ pageParam }) =>
      apiClient.get<ChallengeListResponse>('/campaign/list', {
        Limit: String(PAGE_SIZE),
        Offset: String(pageParam * PAGE_SIZE),
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.flatMap((p) => p.data?.items ?? []).length
      const total = lastPage.data?.totalCount ?? 0
      return loaded < total ? allPages.length : undefined
    },
  })
}

export function useChallengeById(id: string) {
  return useQuery({
    queryKey: ['challenge', id],
    queryFn: () => apiClient.get<ChallengeInfoResponse>('/campaign/info', { Id: id }),
    enabled: !!id,
  })
}
