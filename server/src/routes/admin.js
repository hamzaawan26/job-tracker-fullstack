import express from 'express'
import User from '../models/User.js'
import Job from '../models/Job.js'
import { authMiddleware } from '../middleware/auth.js'
import { adminOnly } from '../middleware/admin.js'
import { asyncHandler } from '../middleware/errors.js'

const router = express.Router()
router.use(authMiddleware, adminOnly)

router.get('/users', asyncHandler(async (req, res) => {
  const users = await User.find()
  res.json(users)
}))

router.get('/jobs', asyncHandler(async (req, res) => {
  const jobs = await Job.find().populate('userId', 'email')
  res.json(jobs)
}))

router.get('/stats', asyncHandler(async (req, res) => {
  const [totalUsers, totalJobs] = await Promise.all([
    User.countDocuments(),
    Job.countDocuments({ isDeleted: false }),
  ])
  res.json({ totalUsers, totalJobs })
}))

export default router
