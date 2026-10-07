import { useEffect, useState } from 'react'
import PaginationControls from '../components/PaginationControls.jsx'
import { api } from '../services/api.js'

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  company: '',
  address: '',
  notes: '',
}

function ClientForm({ client, onCancel, onSave }) {
  const [form, setForm] = useState(client === 'new' ? emptyForm : { ...emptyForm, ...client })
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
    setFieldErrors((current) => ({ ...current, [event.target.name]: '' }))
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const name = form.name.trim()
    const nextErrors = {}
    if (!name) nextErrors.name = 'Client name is required.'
    else if (name.length < 2 || name.length > 100) nextErrors.name = 'Client name must be between 2 and 100 characters.'
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = 'Enter a valid email address.'
    }
    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors)
      return
    }
    setFieldErrors({})

    setIsSaving(true)
    try {
      await onSave({ ...form, name, email: form.email.trim() })
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setIsSaving(false)
    }
  }

  const fields = [
    { name: 'name', label: 'Client name', required: true, placeholder: 'e.g. Morgan Lee' },
    { name: 'email', label: 'Email', type: 'email', placeholder: 'morgan@example.com' },
    { name: 'phone', label: 'Phone', type: 'tel', placeholder: '+1 555 000 0000' },
    { name: 'company', label: 'Company', placeholder: 'Company name' },
  ]

  return (
    <div className="fixed inset-0 z-20 grid items-end bg-ink/40 p-0 sm:items-center sm:p-5" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !isSaving) onCancel()
    }}>
      <section role="dialog" aria-modal="true" aria-labelledby="client-form-title" className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-surface p-5 shadow-xl sm:mx-auto sm:max-w-xl sm:rounded-2xl sm:p-7">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id="client-form-title" className="text-xl font-semibold text-ink">{client === 'new' ? 'Add a client' : 'Edit client'}</h2>
            <p className="mt-1 text-sm text-muted">Keep your client details together in one place.</p>
          </div>
          <button type="button" onClick={onCancel} aria-label="Close form" className="rounded-lg px-2 py-1 text-xl leading-none text-muted hover:bg-page">×</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((field) => (
              <div key={field.name}>
                <label htmlFor={field.name} className="mb-1.5 block text-sm font-medium text-ink">{field.label}{field.required && <span className="text-red-600"> *</span>}</label>
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type || 'text'}
                  required={field.required}
                  value={form[field.name]}
                  onChange={updateField}
                  placeholder={field.placeholder}
                  aria-invalid={Boolean(fieldErrors[field.name])}
                  aria-describedby={fieldErrors[field.name] ? `${field.name}-error` : undefined}
                  className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-ink placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-brand/15 ${fieldErrors[field.name] ? 'border-red-400' : 'border-line focus:border-brand'}`}
                />
                {fieldErrors[field.name] && <p id={`${field.name}-error`} className="mt-1.5 text-xs text-red-700">{fieldErrors[field.name]}</p>}
              </div>
            ))}
          </div>
          <div>
            <label htmlFor="address" className="mb-1.5 block text-sm font-medium text-ink">Address</label>
            <textarea id="address" name="address" rows="2" maxLength={500} value={form.address} onChange={updateField} className="w-full resize-y rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15" />
          </div>
          <div>
            <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-ink">Notes</label>
            <textarea id="notes" name="notes" rows="3" maxLength={2000} value={form.notes} onChange={updateField} className="w-full resize-y rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15" />
          </div>
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onCancel} className="rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-ink hover:bg-page">Cancel</button>
            <button type="submit" disabled={isSaving} className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-60">{isSaving ? 'Saving…' : 'Save client'}</button>
          </div>
        </form>
      </section>
    </div>
  )
}

function ClientCard({ client, onEdit, onDelete }) {
  return (
    <article className="rounded-xl border border-line bg-surface p-5 shadow-panel">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#e7f1ed] font-semibold text-brand-strong">{client.name.slice(0, 1).toUpperCase()}</span>
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-ink">{client.name}</h3>
            <p className="truncate text-sm text-muted">{client.company || 'Independent client'}</p>
          </div>
        </div>
        <div className="flex gap-1">
          <button type="button" onClick={() => onEdit(client)} className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-brand hover:bg-[#e7f1ed]">Edit</button>
          <button type="button" onClick={() => onDelete(client)} className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50">Delete</button>
        </div>
      </div>
      <div className="mt-5 space-y-2 border-t border-line pt-4 text-sm text-muted">
        <p className="break-all">{client.email || 'No email added'}</p>
        <p>{client.phone || 'No phone added'}</p>
      </div>
    </article>
  )
}

export default function ClientsPage() {
  const [clients, setClients] = useState([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const [modalClient, setModalClient] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [pageError, setPageError] = useState('')

  async function loadClients() {
    setPageError('')
    setIsLoading(true)
    try {
      const response = await api.getClients({ search: search.trim(), page, limit: 10 })
      setClients(response.data.clients)
      setPagination(response.pagination)
    } catch (error) {
      setPageError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timeout = window.setTimeout(loadClients, search ? 250 : 0)
    return () => window.clearTimeout(timeout)
  }, [search, page])

  async function saveClient(form) {
    if (modalClient === 'new') {
      await api.createClient(form)
    } else {
      await api.updateClient(modalClient._id, form)
    }
    setModalClient(null)
    setPageError('')
    await loadClients()
  }

  async function deleteClient(client) {
    if (!window.confirm(`Delete ${client.name}? This cannot be undone.`)) return

    try {
      await api.deleteClient(client._id)
      if (clients.length === 1 && page > 1) setPage((current) => current - 1)
      else await loadClients()
    } catch (error) {
      setPageError(error.message)
    }
  }

  return (
    <main className="layout-container py-8 sm:py-10">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-brand">Your network</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Clients</h1>
          <p className="mt-2 text-sm text-muted">A home for the people and teams you work with.</p>
        </div>
        <button type="button" onClick={() => setModalClient('new')} className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-strong">
          <span className="text-lg leading-none">+</span> Add client
        </button>
      </div>

      <section className="mt-7 rounded-xl border border-line bg-surface p-4 shadow-panel sm:p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold text-ink">All clients <span className="ml-1 rounded-full bg-page px-2 py-0.5 text-xs font-medium text-muted">{pagination?.total ?? clients.length}</span></h2>
            <p className="mt-1 text-sm text-muted">Search by name, company, or email.</p>
          </div>
          <label className="w-full sm:max-w-xs">
            <span className="sr-only">Search clients</span>
            <input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Search clients…" className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/70 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15" />
          </label>
        </div>
        {search && <button type="button" onClick={() => { setSearch(''); setPage(1) }} className="mt-3 text-sm font-semibold text-brand hover:text-brand-strong">Clear search</button>}

        {pageError && (
          <div role="alert" className="mt-5 flex flex-col justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 sm:flex-row sm:items-center">
            <p>{pageError}</p>
            <button type="button" onClick={loadClients} className="self-start font-semibold underline sm:self-auto">Try again</button>
          </div>
        )}

        {isLoading ? (
          <p role="status" className="py-16 text-center text-sm text-muted">Loading your clients…</p>
        ) : clients.length === 0 ? (
          <div className="py-16 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-[#e7f1ed] text-xl text-brand">↗</span>
            <h3 className="mt-4 font-semibold text-ink">{search ? 'No matching clients' : 'No clients yet'}</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">{search ? 'Try a different name, company, or email.' : 'Add your first client to keep their contact details close at hand.'}</p>
            {!search && <button type="button" onClick={() => setModalClient('new')} className="mt-5 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-strong">Add your first client</button>}
          </div>
        ) : (
          <>
            <div className="mt-5 hidden overflow-x-auto md:block">
              <table className="w-full min-w-[42rem] border-collapse text-left">
                <thead>
                  <tr className="border-y border-line text-xs font-semibold uppercase tracking-wide text-muted">
                    <th className="px-3 py-3">Client</th><th className="px-3 py-3">Email</th><th className="px-3 py-3">Phone</th><th className="px-3 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client._id} className="border-b border-line last:border-0">
                      <td className="px-3 py-4"><p className="font-semibold text-ink">{client.name}</p><p className="mt-0.5 text-sm text-muted">{client.company || 'Independent client'}</p></td>
                      <td className="break-all px-3 py-4 text-sm text-muted">{client.email || '—'}</td>
                      <td className="px-3 py-4 text-sm text-muted">{client.phone || '—'}</td>
                      <td className="px-3 py-4"><div className="flex justify-end gap-2"><button type="button" onClick={() => setModalClient(client)} className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-brand hover:bg-[#e7f1ed]">Edit</button><button type="button" onClick={() => deleteClient(client)} className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50">Delete</button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-5 grid gap-3 md:hidden">
              {clients.map((client) => <ClientCard key={client._id} client={client} onEdit={setModalClient} onDelete={deleteClient} />)}
            </div>
          </>
        )}
        {!isLoading && clients.length > 0 && <PaginationControls pagination={pagination} onPageChange={setPage} />}
      </section>
      {modalClient && <ClientForm client={modalClient} onCancel={() => setModalClient(null)} onSave={saveClient} />}
    </main>
  )
}
