import { apiClient } from '@/shared/api/client'

export interface RequestCodeResponse {
  data: {
    entity: {
      email: string
      message: string
      accessToken?: string
      expiresAtUtc?: string
      isInstantLogin?: boolean
    }
  }
}

export interface VerifyCodeRequest {
  email: string
  code: string
}

export interface VerifyCodeResponse {
  data: {
    entity: {
      accessToken: string
      expiresAtUtc: string
    }
  }
}

export const authApi = {
  requestCode: (email: string) =>
    apiClient.post<RequestCodeResponse>('/auth/request-code', { email }),

  verifyCode: (data: VerifyCodeRequest) =>
    apiClient.post<VerifyCodeResponse>('/auth/verify-code', data),
}
