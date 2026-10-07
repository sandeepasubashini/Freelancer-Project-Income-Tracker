import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function LoginPage() {
  const { isAuthenticated, isLoading, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isLoading) {
    return <main className="grid min-h-screen place-items-center text-sm text-muted">Restoring your session…</main>
  }
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const normalizedEmail = email.trim()
    const nextErrors = {}
    if (!normalizedEmail) nextErrors.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) nextErrors.email = 'Enter a valid email address.'
    if (!password) nextErrors.password = 'Password is required.'
    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors)
      return
    }
    setFieldErrors({})

    setIsSubmitting(true)
    try {
      await login({ email: normalizedEmail, password })
      navigate('/dashboard', { replace: true })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to pick up where your freelance work left off."
      footer={<>New to FreelanceFlow? <Link className="font-semibold text-brand hover:text-brand-strong" to="/register">Create an account</Link></>}
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        {location.state?.message && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{location.state.message}</p>}
        {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-ink">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
              setFieldErrors((current) => ({ ...current, email: '' }))
              setError('')
            }}
            placeholder="you@example.com"
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
            className={`w-full rounded-lg border bg-white px-3.5 py-3 text-sm text-ink placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-brand/15 ${fieldErrors.email ? 'border-red-400' : 'border-line focus:border-brand'}`}
          />
          {fieldErrors.email && <p id="login-email-error" className="mt-1.5 text-xs text-red-700">{fieldErrors.email}</p>}
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label htmlFor="password" className="text-sm font-medium text-ink">Password</label>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => {
              setPassword(event.target.value)
              setFieldErrors((current) => ({ ...current, password: '' }))
              setError('')
            }}
            placeholder="Enter your password"
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
            className={`w-full rounded-lg border bg-white px-3.5 py-3 text-sm text-ink placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-brand/15 ${fieldErrors.password ? 'border-red-400' : 'border-line focus:border-brand'}`}
          />
          {fieldErrors.password && <p id="login-password-error" className="mt-1.5 text-xs text-red-700">{fieldErrors.password}</p>}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center rounded-lg bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthLayout>
  )
}
