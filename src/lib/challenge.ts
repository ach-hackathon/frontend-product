import { useQuery } from '@tanstack/react-query'
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

interface ChallengeListParams {
  limit?: number
  offset?: number
}

export function useChallenges(params?: ChallengeListParams) {
  return useQuery({
    queryKey: ['challenges', params],
    queryFn: () => {
      const queryParams: Record<string, string> = {}
      if (params?.limit != null) queryParams['Limit'] = String(params.limit)
      if (params?.offset != null) queryParams['Offset'] = String(params.offset)
      return apiClient.get<ChallengeListResponse>('/campaign/list', queryParams)
    },
  })
}