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

export interface UserInfoResponse {
  data: {
    entity: UserApiModel
  }
  error: unknown
}
