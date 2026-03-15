import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { setToken } from '@/shared/lib/token'
import { authApi } from '@/features/auth'

export function ConfirmCodePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const queryClient = useQueryClient()

  const { mutateAsync } = useMutation({
    mutationFn: authApi.verifyCode,
  })

  useEffect(() => {
    const email = searchParams.get('email')
    const code = searchParams.get('code')

    if (!email || !code) {
      navigate('/error', { replace: true })
      return
    }

    mutateAsync({ email, code })
      .then((res) => {
        const { accessToken } = res.data.entity
        if (accessToken) {
          setToken(accessToken)
          queryClient.clear()
          navigate('/', { replace: true })
        } else {
          navigate('/error', { replace: true })
        }
      })
      .catch(() => navigate('/error', { replace: true }))
  }, [])

  return null
}
