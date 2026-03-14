import { useMutation } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import type { CheckInEventDto, CheckInEventResponse } from './types'

export function useCheckInEvent() {
  return useMutation({
    mutationFn: (dto: CheckInEventDto) =>
      apiClient.post<CheckInEventResponse>('/usercampaign/check-in-event', dto),
  })
}
