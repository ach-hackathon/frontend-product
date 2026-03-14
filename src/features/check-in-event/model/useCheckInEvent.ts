import { useMutation } from '@tanstack/react-query'
import type { MutationOptions } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import type { CheckInEventDto, CheckInEventResponse } from './types'

type Options = Pick<
  MutationOptions<CheckInEventResponse, Error, CheckInEventDto>,
  'onSuccess' | 'onError'
>

export function useCheckInEvent(options?: Options) {
  return useMutation({
    mutationFn: (dto: CheckInEventDto) =>
      apiClient.post<CheckInEventResponse>('/usercampaign/check-in-event', dto),
    ...options,
  })
}
