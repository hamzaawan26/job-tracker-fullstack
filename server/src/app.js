import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cors from 'cors'

import authRoutes from './routes/auth.js'
import jobRoutes from './routes/jobs.js'
import analyticsRoutes from './routes/analytics.js'
import adminRoutes from './routes/admin.js'
dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/jobs', jobRoutes)

app.use('/api/analytics', analyticsRoutes)
app.use('/api/admin', adminRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

const PORT = process.env.PORT || 4000

if (process.env.NODE_ENV !== 'test') {
  mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected')
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
  })
    .catch((err) => console.error('❌ MongoDB error:', err))
}
app.disable('etag')

export default app
