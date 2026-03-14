import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import type { EventLeaderboardResponse, EventListResponse, EventProgressResponse, EventTaskInfoResponse } from './types'

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

export function useEventProgress(campaignId: string, userId: string) {
  return useQuery({
    queryKey: ['event-progress', campaignId, userId],
    queryFn: () =>
      apiClient.get<EventProgressResponse>('/usercampaign/campaign-progress', {
        CampaignId: campaignId,
        UserId: userId,
      }),
    enabled: !!campaignId && !!userId,
  })
}

export function useEventLeaderboard(campaignId: string) {
  return useQuery({
    queryKey: ['event-leaderboard', campaignId],
    queryFn: () =>
      apiClient.get<EventLeaderboardResponse>('/campaign/users-points', { CampaignId: campaignId }),
    enabled: !!campaignId,
  })
}

export function useEventTaskById(id: string) {
  return useQuery({
    queryKey: ['event-task', id],
    queryFn: () => apiClient.get<EventTaskInfoResponse>('/usercampaign/event-info', { CampaignEventId: id }),
    enabled: !!id,
  })
}
