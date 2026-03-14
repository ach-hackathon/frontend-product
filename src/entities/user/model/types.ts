export interface UserPoints {
  points: number
  experiencePoints: number
  level: number
}

export interface UserApiModel {
  id: string
  firstName: string | null
  lastName: string | null
  registrationDate: string
  email: string | null
  userPoints: UserPoints | null
}

export type User = UserApiModel

export interface AchievementApiModel {
  id: string
  name: string | null
  description: string | null
  fileId: string | null
}

export interface UserAchievementApiModel {
  id: string
  achievement: AchievementApiModel
  receivedAtUtc: string
}

export interface UserAchievementsResponse {
  data: {
    totalCount: number
    items: UserAchievementApiModel[] | null
  }
  error: unknown
}

export interface UserInfoResponse {
  data: {
    entity: UserApiModel
  }
  error: unknown
}
