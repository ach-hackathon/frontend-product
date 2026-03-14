import { useInfiniteQuery } from '@tanstack/react-query'
import { apiClient } from './apiClient'

export interface ChallengeEventApiModel {
  id: string
  campaignId: string
  name: string | null
  description: string | null
  pointsForCompletions: number
  fileId: string | null
  type: number
  groupKey: string | null
  qrCode: string | null
  latitude: number | null
  longitude: number | null
  completionCondition: number
}

export interface ChallengeApiModel {
  id: string
  name: string | null
  description: string | null
  startDate: string
  endDate: string | null
  pointsForCompletions: number
  applicationId: string
  fileId: string | null
  events: ChallengeEventApiModel[] | null
}

interface ChallengeListResponse {
  data: {
    totalCount: number
    items: ChallengeApiModel[] | null
  }
  error: unknown
}

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
