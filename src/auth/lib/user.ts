export interface JwtPayload {
  aud: string
  exp: number
  iss: string
  scope: string
  sub: string
  unique_name: string
  display_name?: string
}

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

/** Контекст пользователя — данные из /api/user/info */
export type User = UserApiModel

export interface UserInfoResponse {
  data: {
    entity: UserApiModel
  }
  error: unknown
}
