import { useCallback, useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Link } from 'react-router-dom'
import SummaryCard from '../components/SummaryCard.jsx'
import { api } from '../services/api.js'
import { formatCurrency, formatDate } from '../utils/formatters.js'

const statusColors = {
  Pending: '#d69e2e',
  'In Progress': '#3975bd',
  Completed: '#27826f',
  Cancelled: '#8a9690',
}

function ChartPanel({ title, subtitle, children }) {
  return (
    <section className="rounded-xl border border-line bg-surface p-5 shadow-panel">
      <div>
        <h2 className="font-semibold text-ink">{title}</h2>
        <p className="mt-1 text-sm text-muted">{subtitle}</p>
      </div>
      <div className="mt-5 h-64">{children}</div>
    </section>
  )
}

function EmptyChart({ message }) {
  return <div className="grid h-full place-items-center text-center text-sm text-muted">{message}</div>
}

function RecentProjects({ projects }) {
  return (
    <section className="rounded-xl border border-line bg-surface p-5 shadow-panel">
      <div className="flex items-center justify-between gap-3">
        <div><h2 className="font-semibold text-ink">Recent projects</h2><p className="mt-1 text-sm text-muted">Latest additions to your workspace</p></div>
        <Link to="/projects" className="text-sm font-semibold text-brand hover:text-brand-strong">View all</Link>
      </div>
      {projects.length === 0 ? <p className="py-10 text-center text-sm text-muted">Your projects will appear here.</p> : (
        <ul className="mt-4 divide-y divide-line">
          {projects.map((project) => <li key={project._id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
            <div className="min-w-0"><p className="truncate text-sm font-semibold text-ink">{project.projectName}</p><p className="mt-1 truncate text-xs text-muted">{project.client?.name || 'Client unavailable'} · {formatDate(project.createdAt)}</p></div>
            <span className="shrink-0 rounded-full bg-page px-2.5 py-1 text-xs font-medium text-muted">{project.status}</span>
          </li>)}
        </ul>
      )}
    </section>
  )
}

function RecentPayments({ payments }) {
  return (
    <section className="rounded-xl border border-line bg-surface p-5 shadow-panel">
      <div className="flex items-center justify-between gap-3">
        <div><h2 className="font-semibold text-ink">Recent payments</h2><p className="mt-1 text-sm text-muted">Payment activity across your projects</p></div>
        <Link to="/income" className="text-sm font-semibold text-brand hover:text-brand-strong">View all</Link>
      </div>
      {payments.length === 0 ? <p className="py-10 text-center text-sm text-muted">Your payments will appear here.</p> : (
        <ul className="mt-4 divide-y divide-line">
          {payments.map((payment) => <li key={payment._id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
            <div className="min-w-0"><p className="truncate text-sm font-semibold text-ink">{payment.project?.projectName || 'Project unavailable'}</p><p className="mt-1 text-xs text-muted">{formatDate(payment.paymentDate)} · {payment.paymentMethod}</p></div>
            <div className="shrink-0 text-right"><p className="text-sm font-semibold text-ink">{formatCurrency(payment.amount)}</p><p className={`mt-1 text-xs ${payment.paymentStatus === 'Paid' ? 'text-emerald-700' : 'text-amber-800'}`}>{payment.paymentStatus}</p></div>
          </li>)}
        </ul>
      )}
    </section>
  )
}

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDashboard = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await api.getDashboard()
      setDashboard(response.data)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  if (isLoading) {
    return <main className="layout-container py-10"><p role="status" className="rounded-xl border border-line bg-surface p-8 text-center text-sm text-muted">Loading your dashboard…</p></main>
  }

  if (error || !dashboard) {
    return (
      <main className="layout-container py-10">
        <section role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-900">
          <h1 className="font-semibold">Dashboard could not be loaded</h1>
          <p className="mt-2 text-sm">{error || 'The dashboard response was empty.'}</p>
          <button type="button" onClick={loadDashboard} className="mt-4 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-strong">Try again</button>
        </section>
      </main>
    )
  }

  const { statistics, monthlyIncome, projectStatusCounts, recentProjects, recentPayments } = dashboard
  const hasIncome = monthlyIncome.some((item) => item.amount > 0)
  const hasProjects = projectStatusCounts.some((item) => item.count > 0)

  return (
    <main className="layout-container py-8 sm:py-10">
      <div className="mb-7">
        <p className="text-sm font-semibold text-brand">Your workspace</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Dashboard</h1>
        <p className="mt-2 text-sm text-muted">A real-time snapshot of your projects and cash flow.</p>
      </div>

      <section aria-label="Summary statistics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Active Projects" value={statistics.activeProjects} detail="Currently in progress" accent="blue" />
        <SummaryCard label="Total Projects" value={statistics.totalProjects} detail={`${statistics.completedProjects} completed`} />
        <SummaryCard label="Total Income" value={formatCurrency(statistics.totalIncome)} detail="Payments marked paid" accent="green" />
        <SummaryCard label="Pending Payments" value={formatCurrency(statistics.pendingPaymentAmount)} detail={`${statistics.pendingPaymentCount} payment${statistics.pendingPaymentCount === 1 ? '' : 's'} pending`} accent="amber" />
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(18rem,1fr)]">
        <ChartPanel title="Monthly income" subtitle={`Paid payments during ${new Date().getFullYear()}`}>
          {hasIncome ? <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyIncome} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
              <CartesianGrid stroke="#e7ece8" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#5f6d67', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#5f6d67', fontSize: 11 }} tickFormatter={(value) => `$${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`} width={48} />
              <Tooltip formatter={(value) => formatCurrency(value)} cursor={{ fill: '#f4f7f4' }} />
              <Bar dataKey="amount" name="Income" fill="#147565" radius={[5, 5, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer> : <EmptyChart message="Paid income will appear here once payments are recorded." />}
        </ChartPanel>

        <ChartPanel title="Project status" subtitle="How your projects are progressing">
          {hasProjects ? <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={projectStatusCounts.filter((item) => item.count > 0)} dataKey="count" nameKey="status" innerRadius={55} outerRadius={88} paddingAngle={3}>
                {projectStatusCounts.filter((item) => item.count > 0).map((item) => <Cell key={item.status} fill={statusColors[item.status]} />)}
              </Pie>
              <Tooltip formatter={(value, name) => [value, name]} />
            </PieChart>
          </ResponsiveContainer> : <EmptyChart message="Project status breakdown will appear after you add a project." />}
          {hasProjects && <div className="mt-1 flex flex-wrap justify-center gap-x-4 gap-y-2">
            {projectStatusCounts.filter((item) => item.count > 0).map((item) => <span key={item.status} className="inline-flex items-center gap-1.5 text-xs text-muted"><i className="size-2 rounded-full" style={{ backgroundColor: statusColors[item.status] }} />{item.status} ({item.count})</span>)}
          </div>}
        </ChartPanel>
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-2">
        <RecentProjects projects={recentProjects} />
        <RecentPayments payments={recentPayments} />
      </section>
    </main>
  )
}
