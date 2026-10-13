import 'dotenv/config'
import mongoose from 'mongoose'
import app from './app.js'
import { validateEnvironment } from './config/env.js'

const port = Number.parseInt(process.env.PORT, 10) || 4000
let server

async function start() {
  try {
    validateEnvironment()
    await mongoose.connect(process.env.MONGO_URI)
    server = app.listen(port, () => console.log(`JobTracker API listening on port ${port}`))
  } catch (error) {
    console.error('Unable to start JobTracker API:', error.message)
    process.exitCode = 1
  }
}

async function shutdown(signal) {
  console.log(`${signal} received; shutting down`)
  if (server) await new Promise((resolve) => server.close(resolve))
  await mongoose.disconnect()
  process.exit(0)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

start()
