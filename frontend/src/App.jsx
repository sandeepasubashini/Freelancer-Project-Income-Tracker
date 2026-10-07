import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import PublicOnlyRoute from './components/PublicOnlyRoute.jsx'
import WorkspaceLayout from './components/WorkspaceLayout.jsx'
import ClientsPage from './pages/ClientsPage.jsx'
import IncomePage from './pages/IncomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import ProjectsPage from './pages/ProjectsPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'

const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'))

function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<WorkspaceLayout />}>
          <Route path="/dashboard" element={<Suspense fallback={<main className="layout-container py-10 text-center text-sm text-muted">Loading dashboard…</main>}><DashboardPage /></Suspense>} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/income" element={<IncomePage />} />
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