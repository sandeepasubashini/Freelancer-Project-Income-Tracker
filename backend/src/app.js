import cors from 'cors'
import express from 'express'
import authRoutes from './routes/authRoutes.js'
import clientRoutes from './routes/clientRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'
import incomeRoutes from './routes/incomeRoutes.js'
import projectRoutes from './routes/projectRoutes.js'

const app = express()
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'

app.use(cors({ origin: frontendUrl }))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/clients', clientRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/income', incomeRoutes)
app.use('/api/dashboard', dashboardRoutes)

app.get('/api/health', (request, response) => {
  response.status(200).json({
    status: 'ok',
    message: 'Backend is healthy.',
  })
})

app.use((request, response, next) => {
  const error = new Error(`Route not found: ${request.method} ${request.originalUrl}`)
  error.status = 404
  next(error)
})

app.use((error, request, response, next) => {
  if (response.headersSent) {
    return next(error)
  }

  let status = error.status || error.statusCode || 500
  let message = error.message || 'Internal server error.'

  if (error.type === 'entity.parse.failed' || error instanceof SyntaxError && 'body' in error) {
    status = 400
    message = 'Request body contains invalid JSON.'
  } else if (error.name === 'ValidationError') {
    status = 400
    message = Object.values(error.errors || {})[0]?.message || 'Request validation failed.'
  } else if (error.name === 'CastError') {
    status = 400
    message = 'Request contains an invalid identifier or value.'
  } else if (error.code === 11000) {
    status = 409
    message = 'A resource with those details already exists.'
  } else if (
    error.name === 'MongoNetworkError' ||
    error.name === 'MongooseServerSelectionError' ||
    error.name === 'MongoServerSelectionError' ||
    error.name === 'MongooseError' && /buffering timed out/i.test(error.message)
  ) {
    status = 503
    message = 'The database is temporarily unavailable.'
  } else if (error.name === 'MongoServerError') {
    status = 500
    message = 'A database operation could not be completed.'
  }

  if (![400, 401, 403, 404, 409, 413, 415, 422, 429, 503].includes(status)) {
    status = 500
  }

  if (status === 401 && !error.message) message = 'Authentication is required.'
  if (status === 403 && !error.message) message = 'You are not allowed to access this resource.'
  if (status === 404 && !error.message) message = 'Resource not found.'

  const isProduction = process.env.NODE_ENV === 'production'
  if (status === 500 || status === 503) {
    console.error(`${error.name || 'Error'}: ${error.message || 'Unknown error'}`)
  }
  if (isProduction && status >= 500) {
    message = status === 503 ? 'The service is temporarily unavailable.' : 'Internal server error.'
  }

  return response.status(status).json({
    status: 'error',
    message,
  })
})

export default app