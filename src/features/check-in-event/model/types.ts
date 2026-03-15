export interface CheckInEventDto {
  campaignEventId: string
  qrCode?: string | null
  latitude?: number | null
  longitude?: number | null
}

export interface CheckInEventResult {
  isSuccess: boolean
  message: string | null
  pointsEarned: number
  completedAchievementIds: string[] | null
  giftIds: string[] | null
  giftRewardIds: string[] | null
  campaignCompleted: boolean
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
