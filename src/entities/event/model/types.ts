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

// ─── Progress ─────────────────────────────────────────────────────────────────

export interface EventProgressCampaignApiModel {
  id: string
  name: string | null
  description: string | null
  startDate: string
  endDate: string | null
  pointsForCompletions: number
  fileId: string | null
  applicationId: string
}

export interface EventProgressTaskApiModel extends EventTaskApiModel {
  isCompleted: boolean
}

export interface EventProgressApiModel {
  campaign: EventProgressCampaignApiModel
  progressPercent: number
  events: EventProgressTaskApiModel[] | null
}

export interface EventProgressResponse {
  data: {
    entity: EventProgressApiModel
  }
  error: unknown
}

// ─── Task detail (usercampaign/event-info) ────────────────────────────────────

export interface UserCampaignEventApiModel {
  id: string
  name: string | null
  description: string | null
  pointsForCompletions: number
  fileId: string | null
  isCompleted: boolean
}

export interface EventTaskInfoResponse {
  data: {
    entity: UserCampaignEventApiModel
  }
  error: unknown
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export interface EventLeaderboardEntryApiModel {
  id: string
  firstName: string | null
  lastName: string | null
  points: number
}

export interface EventLeaderboardResponse {
  data: {
    totalCount: number
    items: EventLeaderboardEntryApiModel[] | null
  }
  error: unknown
}

// ─── Enums ────────────────────────────────────────────────────────────────────

export const EventTaskType = {
  Single: 1,
  Multiple: 2,
} as const

export const EventTaskCompletionCondition = {
  ScanQrCode: 1,
  VisitLocation: 2,
} as const
