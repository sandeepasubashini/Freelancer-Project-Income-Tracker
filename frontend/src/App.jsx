import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import PublicOnlyRoute from './components/PublicOnlyRoute.jsx'
import WorkspaceLayout from './components/WorkspaceLayout.jsx'
import ClientsPage from './pages/ClientsPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'

function DashboardPlaceholder() {
  const { user } = useAuth()

  return (
    <main className="layout-container py-10">
      <p className="text-sm font-semibold text-brand">Your workspace</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Welcome, {user.name}</h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-muted">Your project and income overview will be available here in a future step. Start by organizing your client relationships.</p>
      <Link to="/clients" className="mt-6 inline-flex rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-strong">View clients</Link>
    </main>
  )
}

function ComingSoon({ title }) {
  return (
    <main className="layout-container py-10">
      <p className="text-sm font-semibold text-brand">Workspace</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">{title}</h1>
      <p className="mt-3 text-sm text-muted">This area is not available yet.</p>
    </main>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<WorkspaceLayout />}>
          <Route path="/dashboard" element={<DashboardPlaceholder />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/projects" element={<ComingSoon title="Projects coming soon" />} />
          <Route path="/income" element={<ComingSoon title="Income tracking coming soon" />} />
        </Route>
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
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