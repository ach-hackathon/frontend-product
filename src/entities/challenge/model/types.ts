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

export interface ChallengeListResponse {
  data: {
    totalCount: number
    items: ChallengeApiModel[] | null
  }
  error: unknown
}
