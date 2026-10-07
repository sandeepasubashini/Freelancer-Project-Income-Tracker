import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../services/api.js'

export default function RegisterPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isLoading) {
    return <main className="grid min-h-screen place-items-center text-sm text-muted">Restoring your session…</main>
  }
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
    setFieldErrors((current) => ({ ...current, [event.target.name]: '' }))
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const name = form.name.trim()
    const email = form.email.trim()
    const nextErrors = {}
    if (!name) nextErrors.name = 'Name is required.'
    else if (name.length < 2 || name.length > 100) nextErrors.name = 'Name must be between 2 and 100 characters.'
    if (!email) nextErrors.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = 'Enter a valid email address.'
    if (!form.password) nextErrors.password = 'Password is required.'
    else if (form.password.length < 8) nextErrors.password = 'Password must be at least 8 characters.'
    else if (new TextEncoder().encode(form.password).length > 72) nextErrors.password = 'Password cannot exceed 72 UTF-8 bytes.'
    if (!form.confirmPassword) nextErrors.confirmPassword = 'Please confirm your password.'
    else if (form.password !== form.confirmPassword) nextErrors.confirmPassword = 'Passwords do not match.'

    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors)
      return
    }
    setFieldErrors({})

    setIsSubmitting(true)
    try {
      await api.register({ name, email, password: form.password })
      navigate('/login', {
        replace: true,
        state: { message: 'Your account is ready. Sign in to continue.' },
      })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      description="A clearer picture of your freelance work starts here."
      footer={<>Already have an account? <Link className="font-semibold text-brand hover:text-brand-strong" to="/login">Sign in</Link></>}
    >
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium text-ink">Full name</label>
          <input id="name" name="name" type="text" autoComplete="name" required value={form.name} onChange={updateField} placeholder="Your name" aria-invalid={Boolean(fieldErrors.name)} aria-describedby={fieldErrors.name ? 'name-error' : undefined} className={`w-full rounded-lg border bg-white px-3.5 py-3 text-sm text-ink placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-brand/15 ${fieldErrors.name ? 'border-red-400' : 'border-line focus:border-brand'}`} />
          {fieldErrors.name && <p id="name-error" className="mt-1.5 text-xs text-red-700">{fieldErrors.name}</p>}
        </div>
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-ink">Email address</label>
          <input id="email" name="email" type="email" autoComplete="email" required value={form.email} onChange={updateField} placeholder="you@example.com" aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? 'email-error' : undefined} className={`w-full rounded-lg border bg-white px-3.5 py-3 text-sm text-ink placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-brand/15 ${fieldErrors.email ? 'border-red-400' : 'border-line focus:border-brand'}`} />
          {fieldErrors.email && <p id="email-error" className="mt-1.5 text-xs text-red-700">{fieldErrors.email}</p>}
        </div>
        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-ink">Password</label>
          <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required value={form.password} onChange={updateField} placeholder="At least 8 characters" aria-invalid={Boolean(fieldErrors.password)} aria-describedby={fieldErrors.password ? 'password-error' : undefined} className={`w-full rounded-lg border bg-white px-3.5 py-3 text-sm text-ink placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-brand/15 ${fieldErrors.password ? 'border-red-400' : 'border-line focus:border-brand'}`} />
          {fieldErrors.password && <p id="password-error" className="mt-1.5 text-xs text-red-700">{fieldErrors.password}</p>}
        </div>
        <div>
          <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-ink">Confirm password</label>
          <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required value={form.confirmPassword} onChange={updateField} placeholder="Re-enter your password" aria-invalid={Boolean(fieldErrors.confirmPassword)} aria-describedby={fieldErrors.confirmPassword ? 'confirmPassword-error' : undefined} className={`w-full rounded-lg border bg-white px-3.5 py-3 text-sm text-ink placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-brand/15 ${fieldErrors.confirmPassword ? 'border-red-400' : 'border-line focus:border-brand'}`} />
          {fieldErrors.confirmPassword && <p id="confirmPassword-error" className="mt-1.5 text-xs text-red-700">{fieldErrors.confirmPassword}</p>}
        </div>
        <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center rounded-lg bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-60">
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  )
}
