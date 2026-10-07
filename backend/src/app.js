import cors from 'cors'
import express from 'express'
import authRoutes from './routes/authRoutes.js'

const app = express()
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'

app.use(cors({ origin: frontendUrl }))
app.use(express.json())

app.use('/api/auth', authRoutes)

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
  console.error(error)

  const status = error.status || 500
  const message =
    status === 500 && process.env.NODE_ENV === 'production'
      ? 'Internal server error.'
      : error.message

  response.status(status).json({
    status: 'error',
    message,
  })
})

export default app