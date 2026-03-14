import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import clsx from 'clsx'
import { Panel } from '../components/Panel/Panel'
import { getToken, setToken } from '../lib/token'
import { authApi } from './api'
import styles from './LoginPage.module.css'

interface LoginFormValues {
  email: string
}

export function LoginPage() {
  const navigate = useNavigate()
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
        setTimeout(() => navigate('/'), 1000)
      } else {
        navigate('/code/sent', { state: { email, message } })
      }
    } catch {
      setError('root', { message: 'Something went wrong. Please try again.' })
    }
  }

  return (
    <div className={clsx(styles.page, leaving && styles.pageLeaving)}>
      <Panel className={styles.panel}>
        <h1 className={styles.title}>Sign in</h1>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className={clsx(styles.input, errors.email && styles.inputError)}
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Enter a valid email address',
                },
              })}
            />
            {errors.email && <span className={styles.errorMessage}>{errors.email.message}</span>}
          </div>

          {errors.root && <span className={styles.errorMessage}>{errors.root.message}</span>}

          <button className={styles.button} type="submit" disabled={isPending}>
            {isPending && <span className={styles.spinner} />}
            {isPending ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </Panel>
    </div>
  )
}
