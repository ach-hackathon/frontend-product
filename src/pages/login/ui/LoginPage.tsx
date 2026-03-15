import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import clsx from 'clsx'
import { getToken, setToken } from '@/shared/lib/token'
import { authApi } from '@/features/auth'
import styles from './LoginPage.module.css'

interface LoginFormValues {
  email: string
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/'
  const [leaving, setLeaving] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormValues>()

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (values: LoginFormValues) => authApi.requestCode(values.email),
  })

  if (getToken()) {
    return <Navigate to="/" replace />
  }

  async function onSubmit(values: LoginFormValues) {
    try {
      const res = await mutateAsync(values)
      const { accessToken, email, message } = res.data.entity

      if (accessToken) {
        setToken(accessToken)
        setLeaving(true)
        const target = redirectTo
        sessionStorage.removeItem('auth_redirect')
        setTimeout(() => navigate(target), 1000)
      } else {
        if (redirectTo !== '/') {
          sessionStorage.setItem('auth_redirect', redirectTo)
        }
        navigate('/code/sent', { state: { email, message } })
      }
    } catch {
      setError('root', { message: 'Что-то пошло не так. Попробуйте ещё раз.' })
    }
  }

  return (
    <div className={clsx(styles.page, leaving && styles.pageLeaving)}>
      <div className={styles.content}>
        <img
          src="/mascot.png"
          alt="EventiGo маскот"
          className={styles.mascot}
          draggable={false}
        />

        <h1 className={styles.title}>
          Добро пожаловать<br />в EventiGo!
        </h1>

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className={clsx(styles.inputWrapper, errors.email && styles.inputWrapperError)}>
            <label className={styles.inputLabel} htmlFor="email">
              Электронная почта
            </label>
            <input
              id="email"
              className={styles.input}
              type="email"
              autoComplete="email"
              {...register('email', {
                required: 'Введите электронную почту',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Введите корректный email',
                },
              })}
            />
          </div>
          {errors.email && <span className={styles.errorMessage}>{errors.email.message}</span>}
          {errors.root && <span className={styles.errorMessage}>{errors.root.message}</span>}

          <button className={styles.button} type="submit" disabled={isPending}>
            {isPending ? <span className={styles.spinner} /> : 'Войти'}
          </button>
        </form>
      </div>

      <p className={styles.footer}>Design by Полуостров Эйнштейна</p>
    </div>
  )
}
