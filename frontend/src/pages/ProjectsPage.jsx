import { useEffect, useState } from 'react'
import PaginationControls from '../components/PaginationControls.jsx'
import { api } from '../services/api.js'

const statuses = ['Pending', 'In Progress', 'Completed', 'Cancelled']
const blankProject = {
  projectName: '',
  client: '',
  description: '',
  status: 'Pending',
  fee: '',
  startDate: '',
  dueDate: '',
}

function dateInputValue(value) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10)
}

function displayDate(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(value))
}

function formatFee(fee) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(fee)
}

function statusClasses(status) {
  const classes = {
    Pending: 'bg-amber-50 text-amber-800',
    'In Progress': 'bg-blue-50 text-blue-800',
    Completed: 'bg-emerald-50 text-emerald-800',
    Cancelled: 'bg-slate-100 text-slate-700',
  }
  return classes[status] || 'bg-slate-100 text-slate-700'
}

function ProjectForm({ project, clients, onCancel, onSave }) {
  const [form, setForm] = useState(project === 'new' ? blankProject : {
    ...blankProject,
    ...project,
    client: typeof project.client === 'object' ? project.client._id : project.client,
    fee: String(project.fee),
    startDate: dateInputValue(project.startDate),
    dueDate: dateInputValue(project.dueDate),
  })
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

    const projectName = form.projectName.trim()
    const fee = Number(form.fee)
    const nextErrors = {}
    if (projectName.length < 2 || projectName.length > 150) {
      nextErrors.projectName = form.projectName.trim() ? 'Project name must be between 2 and 150 characters.' : 'Project name is required.'
    }
    if (!form.client) {
      nextErrors.client = 'Select a client for this project.'
    }
    if (form.fee === '' || !Number.isFinite(fee) || fee < 0) {
      nextErrors.fee = 'Enter a valid non-negative project fee.'
    }
    if (form.startDate && form.dueDate && form.dueDate < form.startDate) {
      nextErrors.dueDate = 'Due date cannot be earlier than the start date.'
    }
    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors)
      return
    }
    setFieldErrors({})

    setIsSaving(true)
    try {
      await onSave({
        projectName,
        client: form.client,
        description: form.description.trim(),
        status: form.status,
        fee,
        startDate: form.startDate || null,
        dueDate: form.dueDate || null,
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
      <section role="dialog" aria-modal="true" aria-labelledby="project-form-title" className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-surface p-5 shadow-xl sm:mx-auto sm:max-w-2xl sm:rounded-2xl sm:p-7">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id="project-form-title" className="text-xl font-semibold text-ink">{project === 'new' ? 'Add a project' : 'Edit project'}</h2>
            <p className="mt-1 text-sm text-muted">Set the client, scope, status, and timing for this project.</p>
          </div>
          <button type="button" onClick={onCancel} aria-label="Close form" className="rounded-lg px-2 py-1 text-xl leading-none text-muted hover:bg-page">×</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="projectName" className="mb-1.5 block text-sm font-medium text-ink">Project name <span className="text-red-600">*</span></label>
              <input id="projectName" name="projectName" required maxLength={150} value={form.projectName} onChange={updateField} placeholder="e.g. Brand identity refresh" aria-invalid={Boolean(fieldErrors.projectName)} aria-describedby={fieldErrors.projectName ? 'projectName-error' : undefined} className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-ink placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-brand/15 ${fieldErrors.projectName ? 'border-red-400' : 'border-line focus:border-brand'}`} />
              {fieldErrors.projectName && <p id="projectName-error" className="mt-1.5 text-xs text-red-700">{fieldErrors.projectName}</p>}
            </div>
            <div>
              <label htmlFor="client" className="mb-1.5 block text-sm font-medium text-ink">Client <span className="text-red-600">*</span></label>
              <select id="client" name="client" required value={form.client} onChange={updateField} aria-invalid={Boolean(fieldErrors.client)} aria-describedby={fieldErrors.client ? 'client-error' : undefined} className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/15 ${fieldErrors.client ? 'border-red-400' : 'border-line focus:border-brand'}`}>
                <option value="">Select a client</option>
                {clients.map((client) => <option key={client._id} value={client._id}>{client.name}{client.company ? ` · ${client.company}` : ''}</option>)}
              </select>
              {fieldErrors.client && <p id="client-error" className="mt-1.5 text-xs text-red-700">{fieldErrors.client}</p>}
              {clients.length === 0 && <p className="mt-1.5 text-xs text-muted">Add a client before creating a project.</p>}
            </div>
            <div>
              <label htmlFor="status" className="mb-1.5 block text-sm font-medium text-ink">Status</label>
              <select id="status" name="status" value={form.status} onChange={updateField} className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15">
                {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="fee" className="mb-1.5 block text-sm font-medium text-ink">Fee <span className="text-red-600">*</span></label>
              <input id="fee" name="fee" type="number" min="0" step="0.01" required value={form.fee} onChange={updateField} placeholder="0.00" aria-invalid={Boolean(fieldErrors.fee)} aria-describedby={fieldErrors.fee ? 'fee-error' : undefined} className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/15 ${fieldErrors.fee ? 'border-red-400' : 'border-line focus:border-brand'}`} />
              {fieldErrors.fee && <p id="fee-error" className="mt-1.5 text-xs text-red-700">{fieldErrors.fee}</p>}
            </div>
            <div>
              <label htmlFor="startDate" className="mb-1.5 block text-sm font-medium text-ink">Start date</label>
              <input id="startDate" name="startDate" type="date" value={form.startDate} onChange={updateField} className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15" />
            </div>
            <div>
              <label htmlFor="dueDate" className="mb-1.5 block text-sm font-medium text-ink">Due date</label>
              <input id="dueDate" name="dueDate" type="date" min={form.startDate || undefined} value={form.dueDate} onChange={updateField} aria-invalid={Boolean(fieldErrors.dueDate)} aria-describedby={fieldErrors.dueDate ? 'dueDate-error' : undefined} className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/15 ${fieldErrors.dueDate ? 'border-red-400' : 'border-line focus:border-brand'}`} />
              {fieldErrors.dueDate && <p id="dueDate-error" className="mt-1.5 text-xs text-red-700">{fieldErrors.dueDate}</p>}
            </div>
          </div>
          <div>
            <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-ink">Description</label>
            <textarea id="description" name="description" rows="3" maxLength={2000} value={form.description} onChange={updateField} placeholder="A short summary of the project scope" className="w-full resize-y rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink placeholder:text-muted/70 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15" />
          </div>
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onCancel} className="rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-ink hover:bg-page">Cancel</button>
            <button type="submit" disabled={isSaving || clients.length === 0} className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-60">{isSaving ? 'Saving…' : 'Save project'}</button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState([])
  const [clients, setClients] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [clientFilter, setClientFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const [modalProject, setModalProject] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [pageError, setPageError] = useState('')

  async function loadProjects() {
    setIsLoading(true)
    setPageError('')
    try {
      const response = await api.getProjects({ search: search.trim(), status: statusFilter, client: clientFilter, page, limit: 10 })
      setProjects(response.data.projects)
      setPagination(response.pagination)
    } catch (error) {
      setPageError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    api.getClients({ limit: 100 })
      .then((clientResponse) => {
        if (isMounted) setClients(clientResponse.data.clients)
      })
      .catch((error) => {
        if (isMounted) setPageError(error.message)
      })
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    const timeout = window.setTimeout(loadProjects, search ? 250 : 0)
    return () => window.clearTimeout(timeout)
  }, [search, statusFilter, clientFilter, page])

  async function saveProject(form) {
    if (modalProject === 'new') {
      const response = await api.createProject(form)
      if (page === 1) setProjects((current) => [response.data.project, ...current].slice(0, pagination?.limit || 10))
      else await loadProjects()
    } else {
      const response = await api.updateProject(modalProject._id, form)
      setProjects((current) => current.map((project) => project._id === response.data.project._id ? response.data.project : project))
    }
    setModalProject(null)
    await loadProjects()
  }

  async function deleteProject(project) {
    if (!window.confirm(`Delete "${project.projectName}"? This cannot be undone.`)) return
    try {
      await api.deleteProject(project._id)
      if (projects.length === 1 && page > 1) setPage((current) => current - 1)
      else await loadProjects()
    } catch (error) {
      setPageError(error.message)
    }
  }

  return (
    <main className="layout-container py-8 sm:py-10">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-brand">Your work</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Projects</h1>
          <p className="mt-2 text-sm text-muted">Track project scope, status, fees, and delivery dates.</p>
        </div>
        <button type="button" onClick={() => setModalProject('new')} className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-strong">
          <span className="text-lg leading-none">+</span> Add project
        </button>
      </div>

      <section className="mt-7 rounded-xl border border-line bg-surface p-4 shadow-panel sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(12rem,1fr)_12rem_12rem]">
          <label>
            <span className="sr-only">Search projects</span>
            <input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Search project name…" className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/70 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15" />
          </label>
          <label>
            <span className="sr-only">Filter by status</span>
            <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1) }} className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15">
              <option value="">All statuses</option>
              {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </label>
          <label>
            <span className="sr-only">Filter by client</span>
            <select value={clientFilter} onChange={(event) => { setClientFilter(event.target.value); setPage(1) }} className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15">
              <option value="">All clients</option>
              {clients.map((client) => <option key={client._id} value={client._id}>{client.name}</option>)}
            </select>
          </label>
        </div>

        {pageError && <div role="alert" className="mt-5 flex flex-col justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 sm:flex-row sm:items-center"><p>{pageError}</p><button type="button" onClick={loadProjects} className="self-start font-semibold underline sm:self-auto">Try again</button></div>}
        {(search || statusFilter || clientFilter) && <button type="button" onClick={() => { setSearch(''); setStatusFilter(''); setClientFilter(''); setPage(1) }} className="mt-3 text-sm font-semibold text-brand hover:text-brand-strong">Clear filters</button>}

        {isLoading ? (
          <p role="status" className="py-16 text-center text-sm text-muted">Loading your projects…</p>
        ) : projects.length === 0 ? (
          <div className="py-16 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-[#e7f1ed] text-xl text-brand">↗</span>
            <h2 className="mt-4 font-semibold text-ink">{search || statusFilter || clientFilter ? 'No matching projects' : 'No projects yet'}</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">{search || statusFilter || clientFilter ? 'Try adjusting your search or filters.' : 'Add a project to keep its scope, status, and dates in view.'}</p>
            {!search && !statusFilter && !clientFilter && <button type="button" onClick={() => setModalProject('new')} className="mt-5 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-strong">Add your first project</button>}
          </div>
        ) : (
          <>
            <div className="mt-5 hidden overflow-x-auto md:block">
              <table className="w-full min-w-[58rem] border-collapse text-left">
                <thead><tr className="border-y border-line text-xs font-semibold uppercase tracking-wide text-muted"><th className="px-3 py-3">Project</th><th className="px-3 py-3">Client</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Fee</th><th className="px-3 py-3">Start</th><th className="px-3 py-3">Due</th><th className="px-3 py-3 text-right">Actions</th></tr></thead>
                <tbody>{projects.map((project) => <tr key={project._id} className="border-b border-line last:border-0">
                  <td className="max-w-56 px-3 py-4"><p className="truncate font-semibold text-ink">{project.projectName}</p>{project.description && <p className="mt-0.5 truncate text-sm text-muted">{project.description}</p>}</td>
                  <td className="px-3 py-4 text-sm text-muted">{project.client?.name || 'Client unavailable'}</td>
                  <td className="px-3 py-4"><span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(project.status)}`}>{project.status}</span></td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-ink">{formatFee(project.fee)}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-muted">{displayDate(project.startDate)}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-muted">{displayDate(project.dueDate)}</td>
                  <td className="px-3 py-4"><div className="flex justify-end gap-2"><button type="button" onClick={() => setModalProject(project)} className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-brand hover:bg-[#e7f1ed]">Edit</button><button type="button" onClick={() => deleteProject(project)} className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50">Delete</button></div></td>
                </tr>)}</tbody>
              </table>
            </div>
            <div className="mt-4 grid gap-3 md:hidden">{projects.map((project) => <article key={project._id} className="rounded-xl border border-line bg-surface p-4">
              <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="break-words font-semibold text-ink">{project.projectName}</h2><p className="mt-1 text-sm text-muted">{project.client?.name || 'Client unavailable'}</p></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(project.status)}`}>{project.status}</span></div>
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-3 text-sm"><div><p className="text-xs text-muted">Fee</p><p className="mt-1 font-semibold text-ink">{formatFee(project.fee)}</p></div><div><p className="text-xs text-muted">Start date</p><p className="mt-1 text-ink">{displayDate(project.startDate)}</p></div><div><p className="text-xs text-muted">Due date</p><p className="mt-1 text-ink">{displayDate(project.dueDate)}</p></div></div>
              {project.description && <p className="mt-3 line-clamp-2 text-sm text-muted">{project.description}</p>}
              <div className="mt-4 flex justify-end gap-2 border-t border-line pt-3"><button type="button" onClick={() => setModalProject(project)} className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-brand hover:bg-[#e7f1ed]">Edit</button><button type="button" onClick={() => deleteProject(project)} className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50">Delete</button></div>
            </article>)}</div>
          </>
        )}
        {!isLoading && projects.length > 0 && <PaginationControls pagination={pagination} onPageChange={setPage} />}
      </section>
      {modalProject && <ProjectForm project={modalProject} clients={clients} onCancel={() => setModalProject(null)} onSave={saveProject} />}
    </main>
  )
}
