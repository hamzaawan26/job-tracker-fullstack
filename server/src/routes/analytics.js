import express from 'express'
import mongoose from 'mongoose'
import Job from '../models/Job.js'
import { authMiddleware } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/errors.js'

const router = express.Router()
router.use(authMiddleware)
const userObjectId = (req) => new mongoose.Types.ObjectId(req.user.id)

router.get('/summary', asyncHandler(async (req, res) => {
  const counts = await Job.aggregate([
    { $match: { userId: userObjectId(req), isDeleted: false } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ])
  const response = { total: 0, applied: 0, interview: 0, offer: 0 }
  counts.forEach(({ _id, count }) => { response[_id] = count; response.total += count })
  res.json(response)
}))

router.get('/platforms', asyncHandler(async (req, res) => {
  const stats = await Job.aggregate([
    { $match: { userId: userObjectId(req), isDeleted: false } },
    { $group: { _id: '$platform', count: { $sum: 1 } } },
    { $project: { _id: 0, platform: '$_id', count: 1 } },
  ])
  res.json(stats)
}))

router.get('/timeline', asyncHandler(async (req, res) => {
  const data = await Job.aggregate([
    { $match: { userId: userObjectId(req), isDeleted: false } },
    { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    { $project: { _id: 0, year: '$_id.year', month: '$_id.month', count: 1 } },
  ])
  res.json(data)
}))

router.get(['/overview', '/status-breakdown'], asyncHandler(async (req, res) => {
  const stats = await Job.aggregate([
    { $match: { userId: userObjectId(req), isDeleted: false } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ])
  if (req.path === '/status-breakdown') {
    return res.json(stats.map(({ _id, count }) => ({ status: _id, count })))
  }
  const response = { totalJobs: 0, applied: 0, interview: 0, offer: 0 }
  stats.forEach(({ _id, count }) => { response[_id] = count; response.totalJobs += count })
  return res.json(response)
}))

router.get('/time-metrics', asyncHandler(async (req, res) => {
  const userId = userObjectId(req)
  const averageDays = async (status) => {
    const result = await Job.aggregate([
      { $match: { userId, status, isDeleted: false } },
      { $project: { days: { $divide: [{ $subtract: ['$updatedAt', '$createdAt'] }, 86400000] } } },
      { $group: { _id: null, avg: { $avg: '$days' } } },
    ])
    return Math.round(result[0]?.avg || 0)
  }
  const [interview, offer] = await Promise.all([
    averageDays({ $in: ['interview', 'offer'] }),
    averageDays('offer'),
  ])
  res.json({ avgTimeToInterviewDays: interview, avgTimeToOfferDays: offer })
}))

router.get('/funnel', asyncHandler(async (req, res) => {
  const stats = await Job.aggregate([
    { $match: { userId: userObjectId(req), isDeleted: false } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ])
  const funnel = { applied: 0, interview: 0, offer: 0 }
  stats.forEach(({ _id, count }) => { funnel[_id] = count })
  res.json({
    funnel,
    conversion: {
      appliedToInterview: funnel.applied ? Math.round((funnel.interview / funnel.applied) * 100) : 0,
      interviewToOffer: funnel.interview ? Math.round((funnel.offer / funnel.interview) * 100) : 0,
    },
  })
}))

export default router
