import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'

function ProtectedDashboardPlaceholder() {
  const { isAuthenticated, isLoading, logout, user } = useAuth()

  if (isLoading) {
    return <main className="grid min-h-screen place-items-center text-sm text-muted">Restoring your session…</main>
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <main className="layout-container py-10">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="text-sm font-semibold text-brand">FreelanceFlow</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Dashboard coming soon</h1>
          <p className="mt-2 text-sm text-muted">You’re signed in as {user.name}.</p>
        </div>
        <button onClick={logout} className="rounded-lg border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-ink hover:bg-page">
          Sign out
        </button>
      </header>
      <p className="mt-8 text-sm text-muted">Your projects and income overview will be available here in a future step.</p>
    </main>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<ProtectedDashboardPlaceholder />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App