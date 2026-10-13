import express from 'express'
import Job from '../models/Job.js'
import { authMiddleware } from '../middleware/auth.js'
import mongoose from 'mongoose'
const router = express.Router()

router.get('/summary', authMiddleware, async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user.id)

  const total = await Job.countDocuments({ userId, isDeleted: false })
  const applied = await Job.countDocuments({
    userId,
    status: 'applied',
    isDeleted: false,
  })
  const interview = await Job.countDocuments({
    userId,
    status: 'interview',
    isDeleted: false,
  })
  const offer = await Job.countDocuments({
    userId,
    status: 'offer',
    isDeleted: false,
  })

  res.json({
    total,
    applied,
    interview,
    offer,
  })
})
router.get('/platforms', authMiddleware, async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user.id)

  const stats = await Job.aggregate([
    {
      $match: {
        userId,
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: '$platform',
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        platform: '$_id',
        count: 1,
      },
    },
  ])

  res.json(stats)
})
router.get('/timeline', authMiddleware, async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user.id)

  const data = await Job.aggregate([
    {
      $match: {
        userId,
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: {
        '_id.year': 1,
        '_id.month': 1,
      },
    },
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        month: '$_id.month',
        count: 1,
      },
    },
  ])

  res.json(data)
})
router.get('/overview', authMiddleware, async (req, res) => {
  const stats = await Job.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(req.user.id),
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ])

  const response = {
    totalJobs: 0,
    applied: 0,
    interview: 0,
    offer: 0,
  }

  stats.forEach((s) => {
    response[s._id] = s.count
    response.totalJobs += s.count
  })

  res.json(response)
})
router.get('/status-breakdown', authMiddleware, async (req, res) => {
  const breakdown = await Job.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(req.user.id),
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        status: '$_id',
        count: 1,
      },
    },
  ])

  res.json(breakdown)
})
router.get('/time-metrics', authMiddleware, async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user.id)

  const interviewStats = await Job.aggregate([
    {
      $match: {
        userId,
        status: { $in: ['interview', 'offer'] },
        isDeleted: false,
      },
    },
    {
      $project: {
        days: {
          $divide: [
            { $subtract: ['$updatedAt', '$createdAt'] },
            1000 * 60 * 60 * 24,
          ],
        },
      },
    },
    {
      $group: {
        _id: null,
        avg: { $avg: '$days' },
      },
    },
  ])
  router.get('/funnel', authMiddleware, async (req, res) => {
    const userId = new mongoose.Types.ObjectId(req.user.id)

    const stats = await Job.aggregate([
      {
        $match: { userId, isDeleted: false },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ])

    const funnel = {
      applied: 0,
      interview: 0,
      offer: 0,
    }

    stats.forEach((s) => {
      funnel[s._id] = s.count
    })

    const conversion = {
      appliedToInterview:
        funnel.applied > 0
          ? Math.round((funnel.interview / funnel.applied) * 100)
          : 0,

      interviewToOffer:
        funnel.interview > 0
          ? Math.round((funnel.offer / funnel.interview) * 100)
          : 0,
    }

    res.json({
      funnel,
      conversion,
    })
  })

  const offerStats = await Job.aggregate([
    {
      $match: {
        userId,
        status: 'offer',
        isDeleted: false,
      },
    },
    {
      $project: {
        days: {
          $divide: [
            { $subtract: ['$updatedAt', '$createdAt'] },
            1000 * 60 * 60 * 24,
          ],
        },
      },
    },
    {
      $group: {
        _id: null,
        avg: { $avg: '$days' },
      },
    },
  ])

  res.json({
    avgTimeToInterviewDays: Math.round(interviewStats[0]?.avg || 0),
    avgTimeToOfferDays: Math.round(offerStats[0]?.avg || 0),
  })
})

export default router
