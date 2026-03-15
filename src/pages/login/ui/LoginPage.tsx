import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import clsx from 'clsx'
import { getToken, setToken } from '@/shared/lib/token'
import { authApi } from '@/features/auth'
import mascotImg from './mascot.png'
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
      setError('root', { message: 'Что-то пошло не так. Попробуйте ещё раз.' })
    }
  }

  return (
    <div className={clsx(styles.page, leaving && styles.pageLeaving)}>
      <img className={styles.mascot} src={mascotImg} alt="EventiGo маскот" />

      <h1 className={styles.title}>
        Добро пожаловать
        <br />
        в EventiGo!
      </h1>

      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className={styles.field}>
          <input
            id="email"
            className={clsx(styles.input, errors.email && styles.inputError)}
            type="email"
            placeholder=" "
            autoComplete="email"
            {...register('email', {
              required: 'Введите email',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Введите корректный email',
              },
            })}
          />
          <label className={styles.label} htmlFor="email">
            Электронная почта
          </label>
          {errors.email && <span className={styles.errorMessage}>{errors.email.message}</span>}
        </div>

        {errors.root && <span className={styles.errorMessage}>{errors.root.message}</span>}

        <button className={styles.button} type="submit" disabled={isPending}>
          {isPending && <span className={styles.spinner} />}
          {isPending ? 'Входим...' : 'Войти'}
        </button>
      </form>

      <footer className={styles.footer}>Design by Полуостров Эйнштейна</footer>
    </div>
  )
}
