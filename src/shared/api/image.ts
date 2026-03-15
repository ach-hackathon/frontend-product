import { useQuery } from '@tanstack/react-query'
import { getToken } from '@/shared/lib/token'

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string

export function useImageUrl(fileId: string | null | undefined) {
  return useQuery({
    queryKey: ['image', fileId],
    queryFn: async (): Promise<string> => {
      const token = getToken()
      const res = await fetch(`${BASE_URL}/image/${fileId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) throw new Error(`HTTP error ${res.status}`)
      const blob = await res.blob()
      return URL.createObjectURL(blob)
    },
    enabled: !!fileId,
    staleTime: Infinity,
    gcTime: 10 * 60 * 1000,
  })
}
