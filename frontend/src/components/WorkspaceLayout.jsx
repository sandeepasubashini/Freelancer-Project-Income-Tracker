import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const navigation = [
  { to: '/dashboard', label: 'Dashboard', icon: '▦' },
  { to: '/clients', label: 'Clients', icon: '♧' },
  { to: '/projects', label: 'Projects', icon: '▤' },
  { to: '/income', label: 'Income & Payments', icon: '$' },
  { to: '/profile', label: 'Profile', icon: '◉' },
]

function NavigationLinks({ onNavigate }) {
  return (
    <nav aria-label="Main navigation" className="space-y-1">
      {navigation.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end
          onClick={onNavigate}
          className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-[#e7f1ed] text-brand-strong' : 'text-muted hover:bg-page hover:text-ink'}`}
        >
          <span aria-hidden="true" className="grid size-5 place-items-center text-base">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

function UserBadge({ user }) {
  const initials = user?.name?.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'U'

  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#e7f1ed] text-sm font-semibold text-brand-strong">{initials}</span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-ink">{user?.name || 'Freelancer'}</p>
        <p className="truncate text-xs text-muted">{user?.email || 'Signed in'}</p>
      </div>
    </div>
  )
}

export default function WorkspaceLayout() {
  const { user, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-page lg:flex">
      <aside className="hidden w-64 shrink-0 border-r border-line bg-surface lg:fixed lg:inset-y-0 lg:flex lg:flex-col">
        <div className="flex h-16 items-center border-b border-line px-6">
          <span className="grid size-9 place-items-center rounded-xl bg-brand text-lg font-semibold text-white">F</span>
          <span className="ml-3 text-lg font-semibold tracking-tight text-ink">FreelanceFlow</span>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted">Workspace</p>
          <NavigationLinks />
        </div>
        <div className="border-t border-line p-4">
          <UserBadge user={user} />
          <button type="button" onClick={logout} className="mt-4 w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-muted transition hover:bg-red-50 hover:text-red-700">
            <span aria-hidden="true" className="mr-3 inline-block w-5 text-center">↪</span>
            Logout
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1 lg:ml-64">
        <header className="sticky top-0 z-10 border-b border-line bg-surface/95 backdrop-blur lg:hidden">
          <div className="flex min-h-16 items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand text-lg font-semibold text-white">F</span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">FreelanceFlow</p>
                <p className="truncate text-xs text-muted">{user?.name || 'Workspace'}</p>
              </div>
            </div>
            <button
              type="button"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-workspace-navigation"
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              className="grid size-10 shrink-0 place-items-center rounded-lg border border-line text-xl text-ink hover:bg-page"
            >
              {isMobileMenuOpen ? '×' : '☰'}
            </button>
          </div>
          {isMobileMenuOpen && (
            <div id="mobile-workspace-navigation" className="border-t border-line px-4 py-4 sm:px-6">
              <NavigationLinks onNavigate={() => setIsMobileMenuOpen(false)} />
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4">
                <UserBadge user={user} />
                <button type="button" onClick={logout} className="rounded-lg px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">Logout</button>
              </div>
            </div>
          )}
        </header>
        <div className="min-h-[calc(100vh-4rem)]">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
