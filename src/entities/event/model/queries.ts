import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import type { EventInfoResponse, EventListResponse, EventTaskInfoResponse } from './types'

const PAGE_SIZE = 9

export function useEvents() {
  return useInfiniteQuery({
    queryKey: ['events'],
    queryFn: ({ pageParam }) =>
      apiClient.get<EventListResponse>('/campaign/list', {
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

export function useEventById(id: string) {
  return useQuery({
    queryKey: ['event', id],
    queryFn: () => apiClient.get<EventInfoResponse>('/campaign/info', { Id: id }),
    enabled: !!id,
  })
}

export function useEventTaskById(id: string) {
  return useQuery({
    queryKey: ['event-task', id],
    queryFn: () => apiClient.get<EventTaskInfoResponse>('/campaign/event-info', { Id: id }),
    enabled: !!id,
  })
}
