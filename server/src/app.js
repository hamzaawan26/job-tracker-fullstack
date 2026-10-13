import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import mongoose from 'mongoose'

import authRoutes from './routes/auth.js'
import jobRoutes from './routes/jobs.js'
import analyticsRoutes from './routes/analytics.js'
import adminRoutes from './routes/admin.js'
import { getCorsOrigins } from './config/env.js'
import { errorHandler, notFound } from './middleware/errors.js'

const app = express()
const allowedOrigins = getCorsOrigins()

app.disable('x-powered-by')
app.disable('etag')
app.use(helmet())
app.use(cors({
  credentials: false,
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true)
    const error = new Error('Origin is not allowed')
    error.status = 403
    return callback(error)
  },
}))
app.use(express.json({ limit: '100kb' }))
app.use(express.urlencoded({ extended: false, limit: '100kb' }))

app.get('/api/health', (req, res) => {
  const ready = mongoose.connection.readyState === 1
  res.status(ready ? 200 : 503).json({ status: ready ? 'ok' : 'unavailable' })
})
app.use('/api/auth', authRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/admin', adminRoutes)
app.use(notFound)
app.use(errorHandler)

export default app
