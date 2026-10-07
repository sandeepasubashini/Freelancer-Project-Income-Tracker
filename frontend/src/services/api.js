const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const TOKEN_KEY = 'freelancer_tracker_token'

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request(path, options = {}) {
  const headers = new Headers(options.headers)
  const token = localStorage.getItem(TOKEN_KEY)

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })
  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(payload?.message || 'The request could not be completed.', response.status)
  }

  return payload
}

export const api = {
  login(credentials) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  },

  register(userDetails) {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userDetails),
    })
  },

  getCurrentUser() {
    return request('/auth/me')
  },

  getClients() {
    return request('/clients')
  },

  createClient(client) {
    return request('/clients', {
      method: 'POST',
      body: JSON.stringify(client),
    })
  },

  updateClient(id, client) {
    return request(`/clients/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(client),
    })
  },

  deleteClient(id) {
    return request(`/clients/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
  },

  getProjects(filters = {}) {
    const query = new URLSearchParams()
    for (const [key, value] of Object.entries(filters)) {
      if (value) query.set(key, value)
    }
    const suffix = query.size ? `?${query.toString()}` : ''
    return request(`/projects${suffix}`)
  },

  createProject(project) {
    return request('/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    })
  },

  updateProject(id, project) {
    return request(`/projects/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(project),
    })
  },

  deleteProject(id) {
    return request(`/projects/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
  },

  getIncome(filters = {}) {
    const query = new URLSearchParams()
    for (const [key, value] of Object.entries(filters)) {
      if (value) query.set(key, value)
    }
    const suffix = query.size ? `?${query.toString()}` : ''
    return request(`/income${suffix}`)
  },

  createIncome(income) {
    return request('/income', {
      method: 'POST',
      body: JSON.stringify(income),
    })
  },

  updateIncome(id, income) {
    return request(`/income/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(income),
    })
  },

  deleteIncome(id) {
    return request(`/income/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
  },

  getDashboard() {
    return request('/dashboard')
  },
}

export { TOKEN_KEY }
