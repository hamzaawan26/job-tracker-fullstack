import express from 'express'
import { body, param, query } from 'express-validator'
import Job from '../models/Job.js'
import { authMiddleware } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/errors.js'
import { validateRequest } from '../middleware/validate.js'
import { isValidStatusTransition } from '../utils/statusRules.js'

const router = express.Router()
const editableFields = ['title', 'company', 'status', 'dateApplied', 'datePosted', 'deadline', 'platform', 'jobLink', 'notes']
const optionalTextFields = new Set(['platform', 'jobLink', 'notes'])
const optionalDateFields = new Set(['dateApplied', 'datePosted', 'deadline'])

const requiredJobRules = [
  body('title').isString().trim().notEmpty().withMessage('Title is required').isLength({ max: 150 }).withMessage('Title must be 150 characters or fewer'),
  body('company').isString().trim().notEmpty().withMessage('Company is required').isLength({ max: 150 }).withMessage('Company must be 150 characters or fewer'),
  body('status').isIn(['applied', 'interview', 'offer']).withMessage('Invalid status'),
  body('platform').optional({ values: 'falsy' }).isString().trim().isLength({ max: 100 }).withMessage('Platform must be 100 characters or fewer'),
  body('jobLink').optional({ values: 'falsy' }).isURL({ protocols: ['http', 'https', 'ftp'], require_protocol: true }).withMessage('Job link must be a valid URL').isLength({ max: 2048 }).withMessage('Job link is too long'),
  body('notes').optional({ values: 'falsy' }).isString().trim().isLength({ max: 5000 }).withMessage('Notes must be 5000 characters or fewer'),
  ...['dateApplied', 'datePosted', 'deadline'].map((field) => body(field).optional({ values: 'falsy' }).isISO8601({ strict: true }).withMessage(`${field} must be a valid date`).toDate()),
]

const patchJobRules = [
  body('title').optional().isString().trim().notEmpty().withMessage('Title cannot be empty').isLength({ max: 150 }).withMessage('Title must be 150 characters or fewer'),
  body('company').optional().isString().trim().notEmpty().withMessage('Company cannot be empty').isLength({ max: 150 }).withMessage('Company must be 150 characters or fewer'),
  body('status').optional().isIn(['applied', 'interview', 'offer']).withMessage('Invalid status'),
  ...requiredJobRules.slice(3),
]

const idRule = param('id').isMongoId().withMessage('Invalid job ID')

function pickJobFields(source) {
  const result = {}
  for (const field of editableFields) {
    if (!Object.hasOwn(source, field)) continue
    const value = source[field]
    if ((optionalTextFields.has(field) || optionalDateFields.has(field)) && value === '') {
      result[field] = undefined
    } else {
      result[field] = field === 'platform' && value ? value.toLowerCase() : value
    }
  }
  return result
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function updateOwnedJob(req, res) {
  const updates = pickJobFields(req.body)
  const job = await Job.findOne({ _id: req.params.id, userId: req.user.id, isDeleted: false })
  if (!job) return res.status(404).json({ error: 'Job not found' })

  const previousStatus = job.status
  const nextStatus = updates.status
  if (nextStatus && !isValidStatusTransition(previousStatus, nextStatus)) {
    return res.status(400).json({ error: `Invalid status transition from ${previousStatus} to ${nextStatus}` })
  }

  Object.assign(job, updates)
  if (nextStatus && nextStatus !== previousStatus) {
    job.statusHistory.push({ status: nextStatus })
  }
  await job.save()
  return res.json(job)
}

router.use(authMiddleware)

router.get('/', [
  query('page').optional().isInt({ min: 1, max: 100000 }).withMessage('Page must be a positive integer').toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50').toInt(),
  query('status').optional({ values: 'falsy' }).isIn(['applied', 'interview', 'offer']).withMessage('Invalid status filter'),
  query('platform').optional({ values: 'falsy' }).isString().trim().isLength({ max: 100 }).withMessage('Platform filter is too long'),
  query('search').optional({ values: 'falsy' }).isString().trim().isLength({ max: 100 }).withMessage('Search must be 100 characters or fewer'),
], validateRequest, asyncHandler(async (req, res) => {
  const page = req.query.page || 1
  const limit = req.query.limit || 10
  const filter = { userId: req.user.id, isDeleted: false }

  if (req.query.status) filter.status = req.query.status
  if (req.query.platform) filter.platform = req.query.platform.toLowerCase()
  if (req.query.search) {
    const safeSearch = escapeRegex(req.query.search)
    filter.$or = [
      { title: { $regex: safeSearch, $options: 'i' } },
      { company: { $regex: safeSearch, $options: 'i' } },
    ]
  }

  const [jobs, total] = await Promise.all([
    Job.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Job.countDocuments(filter),
  ])
  res.json({ data: jobs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
}))

router.get('/:id', idRule, validateRequest, asyncHandler(async (req, res) => {
  const job = await Job.findOne({ _id: req.params.id, userId: req.user.id, isDeleted: false })
  if (!job) return res.status(404).json({ error: 'Job not found' })
  return res.json(job)
}))

router.post('/', requiredJobRules, validateRequest, asyncHandler(async (req, res) => {
  const input = pickJobFields(req.body)
  const exists = await Job.exists({ userId: req.user.id, title: input.title, company: input.company, isDeleted: false })
  if (exists) return res.status(409).json({ error: 'Duplicate job entry detected' })
  const job = await Job.create({ ...input, userId: req.user.id })
  return res.status(201).json(job)
}))

router.put('/:id', idRule, requiredJobRules, validateRequest, asyncHandler(updateOwnedJob))
router.patch('/:id', idRule, patchJobRules, validateRequest, asyncHandler(updateOwnedJob))

router.delete('/:id', idRule, validateRequest, asyncHandler(async (req, res) => {
  const job = await Job.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id, isDeleted: false },
    { isDeleted: true },
    { returnDocument: 'after' }
  )
  if (!job) return res.status(404).json({ error: 'Job not found' })
  return res.json({ message: 'Job soft-deleted' })
}))

export default router
