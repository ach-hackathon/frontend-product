export interface UserPoints {
  points: number
  experiencePoints: number
  level: number
}

export interface ApplicationApiModel {
  id: string
  name: string | null
  description: string | null
  domain: string | null
  fileId: string | null
}

export interface RoleApiModel {
  id: string
  name: string | null
}

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

export interface UserApiModel {
  id: string
  firstName: string | null
  lastName: string | null
  email: string | null
  balance: number
  applications: ApplicationApiModel[] | null
  roles: RoleApiModel[] | null
  // поля, которые может вернуть расширенный API
  registrationDate?: string
  userPoints?: UserPoints | null
}

export type User = UserApiModel

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
