import { useEffect, useMemo, useState } from 'react'
import { api } from '../services/api.js'
import { formatCurrency, formatDate } from '../utils/formatters.js'

const paymentStatuses = ['Pending', 'Paid']
const paymentMethods = ['Cash', 'Bank Transfer', 'Card', 'Other']
const blankPayment = {
  project: '',
  amount: '',
  paymentDate: '',
  paymentStatus: 'Pending',
  paymentMethod: 'Other',
  notes: '',
}

function dateInputValue(value) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10)
}

function PaymentForm({ income, projects, onCancel, onSave }) {
  const [form, setForm] = useState(income === 'new' ? blankPayment : {
    ...blankPayment,
    ...income,
    project: typeof income.project === 'object' ? income.project._id : income.project,
    amount: String(income.amount),
    paymentDate: dateInputValue(income.paymentDate),
  })
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    const amount = Number(form.amount)
    if (!form.project) {
      setError('Select a project for this payment.')
      return
    }
    if (form.amount === '' || !Number.isFinite(amount) || amount <= 0) {
      setError('Payment amount must be greater than 0.')
      return
    }
    if (!form.paymentDate || !/^\d{4}-\d{2}-\d{2}$/.test(form.paymentDate)) {
      setError('Enter a valid payment date.')
      return
    }

    setIsSaving(true)
    try {
      await onSave({
        project: form.project,
        amount,
        paymentDate: form.paymentDate,
        paymentStatus: form.paymentStatus,
        paymentMethod: form.paymentMethod,
        notes: form.notes.trim(),
      })
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-20 grid items-end bg-ink/40 p-0 sm:items-center sm:p-5" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !isSaving) onCancel()
    }}>
      <section role="dialog" aria-modal="true" aria-labelledby="payment-form-title" className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-surface p-5 shadow-xl sm:mx-auto sm:max-w-xl sm:rounded-2xl sm:p-7">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id="payment-form-title" className="text-xl font-semibold text-ink">{income === 'new' ? 'Add a payment' : 'Edit payment'}</h2>
            <p className="mt-1 text-sm text-muted">Record an incoming project payment.</p>
          </div>
          <button type="button" onClick={onCancel} aria-label="Close form" className="rounded-lg px-2 py-1 text-xl leading-none text-muted hover:bg-page">×</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
          <div>
            <label htmlFor="payment-project" className="mb-1.5 block text-sm font-medium text-ink">Project <span className="text-red-600">*</span></label>
            <select id="payment-project" name="project" required value={form.project} onChange={updateField} className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15">
              <option value="">Select a project</option>
              {projects.map((project) => <option key={project._id} value={project._id}>{project.projectName}</option>)}
            </select>
            {projects.length === 0 && <p className="mt-1.5 text-xs text-muted">Add a project before recording a payment.</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="payment-amount" className="mb-1.5 block text-sm font-medium text-ink">Amount <span className="text-red-600">*</span></label>
              <input id="payment-amount" name="amount" type="number" min="0.01" step="0.01" required value={form.amount} onChange={updateField} placeholder="0.00" className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15" />
            </div>
            <div>
              <label htmlFor="payment-date" className="mb-1.5 block text-sm font-medium text-ink">Payment date <span className="text-red-600">*</span></label>
              <input id="payment-date" name="paymentDate" type="date" required value={form.paymentDate} onChange={updateField} className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15" />
            </div>
            <div>
              <label htmlFor="payment-status" className="mb-1.5 block text-sm font-medium text-ink">Status</label>
              <select id="payment-status" name="paymentStatus" value={form.paymentStatus} onChange={updateField} className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15">
                {paymentStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="payment-method" className="mb-1.5 block text-sm font-medium text-ink">Method</label>
              <select id="payment-method" name="paymentMethod" value={form.paymentMethod} onChange={updateField} className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15">
                {paymentMethods.map((method) => <option key={method} value={method}>{method}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="payment-notes" className="mb-1.5 block text-sm font-medium text-ink">Notes</label>
            <textarea id="payment-notes" name="notes" rows="3" maxLength={2000} value={form.notes} onChange={updateField} className="w-full resize-y rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15" />
          </div>
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onCancel} className="rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-ink hover:bg-page">Cancel</button>
            <button type="submit" disabled={isSaving || projects.length === 0} className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-60">{isSaving ? 'Saving…' : 'Save payment'}</button>
          </div>
        </form>
      </section>
    </div>
  )
}

function statusClasses(status) {
  return status === 'Paid' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
}

function PaymentCard({ income, onEdit, onDelete }) {
  return (
    <article className="rounded-xl border border-line bg-surface p-4 shadow-panel">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="break-words font-semibold text-ink">{income.project?.projectName || 'Project unavailable'}</h2>
          <p className="mt-1 text-sm text-muted">{formatDate(income.paymentDate)}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(income.paymentStatus)}`}>{income.paymentStatus}</span>
      </div>
      <div className="mt-4 flex items-end justify-between gap-3 border-t border-line pt-3">
        <div>
          <p className="text-xs text-muted">{income.paymentMethod}</p>
          <p className="mt-1 text-lg font-semibold text-ink">{formatCurrency(income.amount)}</p>
        </div>
        <div className="flex gap-1">
          <button type="button" onClick={() => onEdit(income)} className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-brand hover:bg-[#e7f1ed]">Edit</button>
          <button type="button" onClick={() => onDelete(income)} className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50">Delete</button>
        </div>
      </div>
    </article>
  )
}

export default function IncomePage() {
  const [records, setRecords] = useState([])
  const [projects, setProjects] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [projectFilter, setProjectFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [modalIncome, setModalIncome] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [projectError, setProjectError] = useState('')

  async function loadRecords() {
    setPageError('')
    setIsLoading(true)
    try {
      const response = await api.getIncome({
        paymentStatus: statusFilter,
        project: projectFilter,
        startDate,
        endDate,
      })
      setRecords(response.data.income)
    } catch (error) {
      setPageError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    api.getProjects()
      .then((response) => {
        if (isMounted) {
          setProjects(response.data.projects)
          setProjectError('')
        }
      })
      .catch((error) => {
        if (isMounted) setProjectError(error.message)
      })
    return () => { isMounted = false }
  }, [])

  useEffect(() => {
    let isMounted = true
    const timeout = window.setTimeout(async () => {
      setPageError('')
      setIsLoading(true)
      try {
        const response = await api.getIncome({
          paymentStatus: statusFilter,
          project: projectFilter,
          startDate,
          endDate,
        })
        if (isMounted) setRecords(response.data.income)
      } catch (error) {
        if (isMounted) setPageError(error.message)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }, 200)
    return () => {
      isMounted = false
      window.clearTimeout(timeout)
    }
  }, [statusFilter, projectFilter, startDate, endDate])

  const totals = useMemo(() => records.reduce((result, record) => {
    if (record.paymentStatus === 'Paid') result.paid += record.amount
    else if (record.paymentStatus === 'Pending') result.pending += record.amount
    return result
  }, { paid: 0, pending: 0 }), [records])

  async function saveIncome(form) {
    if (modalIncome === 'new') {
      await api.createIncome(form)
    } else {
      await api.updateIncome(modalIncome._id, form)
    }
    setModalIncome(null)
    await loadRecords()
  }

  async function deleteIncome(income) {
    const projectName = income.project?.projectName || 'this project'
    if (!window.confirm(`Delete the ${formatCurrency(income.amount)} payment for ${projectName}? This cannot be undone.`)) return
    try {
      await api.deleteIncome(income._id)
      setRecords((current) => current.filter((record) => record._id !== income._id))
    } catch (error) {
      setPageError(error.message)
    }
  }

  return (
    <main className="layout-container py-8 sm:py-10">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-brand">Cash flow</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Income &amp; payments</h1>
          <p className="mt-2 text-sm text-muted">Record payments and keep track of what’s still due.</p>
        </div>
        <button type="button" onClick={() => setModalIncome('new')} className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-strong"><span className="text-lg leading-none">+</span> Add payment</button>
      </div>

      <section className="mt-7 grid gap-4 sm:grid-cols-2">
        <article className="rounded-xl border border-line bg-surface p-5 shadow-panel">
          <p className="text-sm font-medium text-muted">Paid income</p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-ink">{formatCurrency(totals.paid)}</p>
          <p className="mt-1 text-xs text-muted">From the current payment list</p>
        </article>
        <article className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 shadow-panel">
          <p className="text-sm font-medium text-amber-900">Pending payment amount</p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-amber-950">{formatCurrency(totals.pending)}</p>
          <p className="mt-1 text-xs text-amber-800">From the current payment list</p>
        </article>
      </section>

      <section className="mt-6 rounded-xl border border-line bg-surface p-4 shadow-panel sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label><span className="sr-only">Filter by payment status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"><option value="">All statuses</option>{paymentStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
          <label><span className="sr-only">Filter by project</span><select value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)} className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"><option value="">All projects</option>{projects.map((project) => <option key={project._id} value={project._id}>{project.projectName}</option>)}</select></label>
          <label className="flex items-center gap-2 rounded-lg border border-line px-3"><span className="shrink-0 text-xs text-muted">From</span><input aria-label="Filter start date" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="min-w-0 w-full py-2 text-sm text-ink focus:outline-none" /></label>
          <label className="flex items-center gap-2 rounded-lg border border-line px-3"><span className="shrink-0 text-xs text-muted">To</span><input aria-label="Filter end date" type="date" value={endDate} min={startDate || undefined} onChange={(event) => setEndDate(event.target.value)} className="min-w-0 w-full py-2 text-sm text-ink focus:outline-none" /></label>
        </div>

        {(pageError || projectError) && <div role="alert" className="mt-5 flex flex-col justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 sm:flex-row sm:items-center"><p>{pageError || projectError}</p><button type="button" onClick={loadRecords} className="self-start font-semibold underline sm:self-auto">Try again</button></div>}
        {isLoading ? <p role="status" className="py-16 text-center text-sm text-muted">Loading your payments…</p>
          : records.length === 0 ? <div className="py-16 text-center"><span className="mx-auto grid size-12 place-items-center rounded-full bg-[#e7f1ed] text-xl text-brand">$</span><h2 className="mt-4 font-semibold text-ink">No payments found</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">{statusFilter || projectFilter || startDate || endDate ? 'Try changing your filters.' : 'Record a payment to start tracking your income.'}</p>{!statusFilter && !projectFilter && !startDate && !endDate && projects.length > 0 && <button type="button" onClick={() => setModalIncome('new')} className="mt-5 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-strong">Add your first payment</button>}</div>
            : <>
              <div className="mt-5 hidden overflow-x-auto md:block"><table className="w-full min-w-[48rem] border-collapse text-left"><thead><tr className="border-y border-line text-xs font-semibold uppercase tracking-wide text-muted"><th className="px-3 py-3">Project</th><th className="px-3 py-3">Payment date</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Method</th><th className="px-3 py-3 text-right">Amount</th><th className="px-3 py-3 text-right">Actions</th></tr></thead><tbody>{records.map((income) => <tr key={income._id} className="border-b border-line last:border-0"><td className="px-3 py-4 font-semibold text-ink">{income.project?.projectName || 'Project unavailable'}</td><td className="whitespace-nowrap px-3 py-4 text-sm text-muted">{formatDate(income.paymentDate)}</td><td className="px-3 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(income.paymentStatus)}`}>{income.paymentStatus}</span></td><td className="px-3 py-4 text-sm text-muted">{income.paymentMethod}</td><td className="whitespace-nowrap px-3 py-4 text-right text-sm font-semibold text-ink">{formatCurrency(income.amount)}</td><td className="px-3 py-4"><div className="flex justify-end gap-2"><button type="button" onClick={() => setModalIncome(income)} className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-brand hover:bg-[#e7f1ed]">Edit</button><button type="button" onClick={() => deleteIncome(income)} className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50">Delete</button></div></td></tr>)}</tbody></table></div>
              <div className="mt-4 grid gap-3 md:hidden">{records.map((income) => <PaymentCard key={income._id} income={income} onEdit={setModalIncome} onDelete={deleteIncome} />)}</div>
            </>}
      </section>
      {modalIncome && <PaymentForm income={modalIncome} projects={projects} onCancel={() => setModalIncome(null)} onSave={saveIncome} />}
    </main>
  )
}
