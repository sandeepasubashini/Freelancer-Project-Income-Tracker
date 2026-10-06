import 'dotenv/config'
import express from 'express'
import { connectToDatabase } from './config/database.js'

const app = express()
const port = process.env.PORT || 5000

async function startServer() {
  try {
    await connectToDatabase()

    app.listen(port, () => {
      console.log(`Backend server listening on http://localhost:${port}`)
    })
  } catch (error) {
    console.error(`Backend startup failed: ${error.message}`)
    process.exit(1)
  }
}

startServer()