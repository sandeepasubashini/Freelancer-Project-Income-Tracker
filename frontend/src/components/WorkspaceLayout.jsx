import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const navigation = [
  { to: '/dashboard', label: 'Overview' },
  { to: '/clients', label: 'Clients' },
  { to: '/projects', label: 'Projects' },
  { to: '/income', label: 'Income' },
]

export default function WorkspaceLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-page">
      <header className="border-b border-line bg-surface">
        <div className="layout-container flex min-h-16 flex-wrap items-center justify-between gap-4 py-3">
          <NavLink to="/dashboard" className="flex items-center gap-3 text-lg font-semibold tracking-tight text-ink">
            <span className="grid size-9 place-items-center rounded-xl bg-brand text-lg text-white">F</span>
            FreelanceFlow
          </NavLink>
          <nav aria-label="Main navigation" className="order-3 flex w-full gap-1 overflow-x-auto sm:order-none sm:w-auto">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-[#e7f1ed] text-brand-strong' : 'text-muted hover:bg-page hover:text-ink'}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden max-w-40 truncate text-sm text-muted md:inline">{user?.name}</span>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-line px-3 py-2 text-sm font-semibold text-ink transition hover:bg-page"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <Outlet />
    </div>
  )
}
