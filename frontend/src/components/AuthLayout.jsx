import { Link } from 'react-router-dom'

export default function AuthLayout({ children, footer, title, description }) {
  return (
    <main className="min-h-screen bg-page lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(26rem,0.9fr)]">
      <aside className="relative hidden overflow-hidden bg-brand px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">
        <div aria-hidden="true" className="absolute -right-28 -top-24 size-96 rounded-full border border-white/10" />
        <div aria-hidden="true" className="absolute -bottom-40 -left-24 size-[30rem] rounded-full border border-white/10" />
        <Link to="/" className="relative z-10 flex items-center gap-3 text-lg font-semibold tracking-tight">
          <span className="grid size-10 place-items-center rounded-xl bg-white/15 text-xl">F</span>
          FreelanceFlow
        </Link>
        <section className="relative z-10 max-w-xl pb-10">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
            More clarity. More momentum.
          </p>
          <h1 className="text-5xl font-semibold leading-tight tracking-tight xl:text-6xl">
            Make room for your best work.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-white/75">
            Keep projects, income, and the next big idea moving in the right direction.
          </p>
          <div className="mt-12 flex items-center gap-3 text-sm text-white/80">
            <span className="flex -space-x-2" aria-hidden="true">
              <span className="size-8 rounded-full border-2 border-brand bg-[#e8b99c]" />
              <span className="size-8 rounded-full border-2 border-brand bg-[#d6dfb0]" />
              <span className="size-8 rounded-full border-2 border-brand bg-[#b9d6d0]" />
            </span>
            Built for independent professionals
          </div>
        </section>
        <p className="relative z-10 text-xs text-white/60">Your work, thoughtfully organized.</p>
      </aside>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-10 flex items-center gap-3 text-lg font-semibold tracking-tight text-ink lg:hidden">
            <span className="grid size-10 place-items-center rounded-xl bg-brand text-xl text-white">F</span>
            FreelanceFlow
          </Link>
          <header className="mb-8">
            <p className="mb-3 text-sm font-semibold text-brand">Freelancer Project &amp; Income Tracker</p>
            <h2 className="text-3xl font-semibold tracking-tight text-ink">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
          </header>
          <div className="rounded-panel border border-line bg-surface p-6 shadow-panel sm:p-8">
            {children}
          </div>
          {footer && <p className="mt-6 text-center text-sm text-muted">{footer}</p>}
        </div>
      </section>
    </main>
  )
}
