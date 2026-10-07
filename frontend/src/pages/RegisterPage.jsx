import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../services/api.js'

export default function RegisterPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
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
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const name = form.name.trim()
    const email = form.email.trim()
    if (!name || !email || !form.password || !form.confirmPassword) {
      setError('Complete all fields to create your account.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address.')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }
    if (new TextEncoder().encode(form.password).length > 72) {
      setError('Password cannot be longer than 72 UTF-8 bytes.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

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
          <input id="name" name="name" type="text" autoComplete="name" required value={form.name} onChange={updateField} placeholder="Your name" className="w-full rounded-lg border border-line bg-white px-3.5 py-3 text-sm text-ink placeholder:text-muted/70 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15" />
        </div>
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-ink">Email address</label>
          <input id="email" name="email" type="email" autoComplete="email" required value={form.email} onChange={updateField} placeholder="you@example.com" className="w-full rounded-lg border border-line bg-white px-3.5 py-3 text-sm text-ink placeholder:text-muted/70 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15" />
        </div>
        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-ink">Password</label>
          <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required value={form.password} onChange={updateField} placeholder="At least 8 characters" className="w-full rounded-lg border border-line bg-white px-3.5 py-3 text-sm text-ink placeholder:text-muted/70 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15" />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-ink">Confirm password</label>
          <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required value={form.confirmPassword} onChange={updateField} placeholder="Re-enter your password" className="w-full rounded-lg border border-line bg-white px-3.5 py-3 text-sm text-ink placeholder:text-muted/70 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15" />
        </div>
        <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center rounded-lg bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-60">
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  )
}
