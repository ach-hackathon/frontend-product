export interface CheckInEventDto {
  campaignEventId: string
  qrCode?: string | null
  latitude?: number | null
  longitude?: number | null
}

export interface CheckInEventResult {
  pointsEarned: number
  achievementIds: string[] | null
  giftIds: string[] | null
  isEventCompleted: boolean
}

export interface CheckInEventResponse {
  data: {
    entity: CheckInEventResult
  }
  error: {
    title: string | null
    detail: string | null
    errorCode: number | null
  } | null
}
