export interface GiftApiModel {
  id: string
  applicationId: string
  name: string | null
  description: string | null
  fileId: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface UserGiftApiModel {
  id: string
  giftId: string
  userId: string
  status: UserGiftStatus
  createdAt: string
  updatedAt: string
  gift: GiftApiModel | null
}

export const UserGiftStatus = {
  Pending: 1,
  Done: 2,
  Cancelled: 3,
} as const

export type UserGiftStatus = (typeof UserGiftStatus)[keyof typeof UserGiftStatus]

export interface UserGiftsResponse {
  data: {
    totalCount: number
    items: UserGiftApiModel[] | null
  }
  error: unknown
}
