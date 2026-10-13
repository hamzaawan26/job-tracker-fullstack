import express from 'express'
import User from '../models/User.js'
import Job from '../models/Job.js'
import { authMiddleware } from '../middleware/auth.js'
import { adminOnly } from '../middleware/admin.js'

const router = express.Router()

router.use(authMiddleware, adminOnly)

// Users overview
router.get('/users', async (req, res) => {
  const users = await User.find().select('-password')
  res.json(users)
})

// Jobs overview
router.get('/jobs', async (req, res) => {
  const jobs = await Job.find().populate('userId', 'email')
  res.json(jobs)
})

// Platform stats
router.get('/stats', async (req, res) => {
  const totalUsers = await User.countDocuments()
  const totalJobs = await Job.countDocuments({ isDeleted: false })

  res.json({ totalUsers, totalJobs })
})

export default router
