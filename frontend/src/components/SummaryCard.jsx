export default function SummaryCard({ label, value, detail, accent = 'brand' }) {
  const accentClasses = accent === 'amber'
    ? 'bg-amber-50 text-amber-900'
    : accent === 'blue'
      ? 'bg-blue-50 text-blue-900'
      : accent === 'green'
        ? 'bg-emerald-50 text-emerald-900'
        : 'bg-[#e7f1ed] text-brand-strong'

  return (
    <article className="rounded-xl border border-line bg-surface p-5 shadow-panel">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted">{label}</p>
        <span className={`grid size-9 place-items-center rounded-lg text-xs font-bold ${accentClasses}`} aria-hidden="true">
          {label === 'Total Income' ? '$' : label === 'Pending Payments' ? '…' : '#'}
        </span>
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight text-ink">{value}</p>
      {detail && <p className="mt-1 text-xs text-muted">{detail}</p>}
    </article>
  )
}
