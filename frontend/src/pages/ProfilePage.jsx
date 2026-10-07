import { useEffect, useState } from 'react'
import { api } from '../services/api.js'
import { formatDate } from '../utils/formatters.js'

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadProfile() {
    setIsLoading(true)
    setError('')
    try {
      const response = await api.getCurrentUser()
      setUser(response.data.user)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  return (
    <main className="layout-container py-8 sm:py-10">
      <div className="mb-7">
        <p className="text-sm font-semibold text-brand">Account</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Profile</h1>
        <p className="mt-2 text-sm text-muted">Your account information.</p>
      </div>

      {isLoading ? (
        <section role="status" className="rounded-xl border border-line bg-surface p-8 text-center text-sm text-muted shadow-panel">Loading your profile…</section>
      ) : error ? (
        <section role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-900">
          <h2 className="font-semibold">Profile could not be loaded</h2>
          <p className="mt-2 text-sm">{error}</p>
          <button type="button" onClick={loadProfile} className="mt-4 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-strong">Try again</button>
        </section>
      ) : (
        <section className="max-w-2xl rounded-xl border border-line bg-surface p-5 shadow-panel sm:p-8">
          <div className="flex items-center gap-4 border-b border-line pb-6">
            <span className="grid size-14 place-items-center rounded-full bg-[#e7f1ed] text-lg font-semibold text-brand-strong">
              {user.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-ink">{user.name}</h2>
              <p className="truncate text-sm text-muted">{user.email}</p>
            </div>
          </div>
          <dl className="divide-y divide-line">
            <div className="grid gap-1 py-4 sm:grid-cols-[12rem_1fr] sm:gap-4">
              <dt className="text-sm text-muted">Name</dt>
              <dd className="break-words text-sm font-medium text-ink">{user.name}</dd>
            </div>
            <div className="grid gap-1 py-4 sm:grid-cols-[12rem_1fr] sm:gap-4">
              <dt className="text-sm text-muted">Email</dt>
              <dd className="break-all text-sm font-medium text-ink">{user.email}</dd>
            </div>
            <div className="grid gap-1 py-4 sm:grid-cols-[12rem_1fr] sm:gap-4">
              <dt className="text-sm text-muted">Account created</dt>
              <dd className="text-sm font-medium text-ink">{formatDate(user.createdAt)}</dd>
            </div>
          </dl>
        </section>
      )}
    </main>
  )
}
