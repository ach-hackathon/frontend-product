export interface EventTaskApiModel {
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

export interface EventApiModel {
  id: string
  name: string | null
  description: string | null
  startDate: string
  endDate: string | null
  pointsForCompletions: number
  applicationId: string
  fileId: string | null
  events: EventTaskApiModel[] | null
}

export interface EventListResponse {
  data: {
    totalCount: number
    items: EventApiModel[] | null
  }
  error: unknown
}

export interface EventInfoResponse {
  data: {
    entity: EventApiModel
  }
  error: unknown
}

export const EventTaskType = {
  Single: 1,
  Multiple: 2,
} as const

export const EventTaskCompletionCondition = {
  ScanQrCode: 1,
  VisitLocation: 2,
} as const
