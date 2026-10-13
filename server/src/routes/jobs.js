import express from 'express'
import Job from '../models/Job.js'
import { authMiddleware } from '../middleware/auth.js'
import { body, validationResult } from 'express-validator'
import { isValidStatusTransition } from '../utils/statusRules.js'

const router = express.Router()
const normalizePlatform = (platform) => {
  if (!platform) return platform
  return platform.trim().toLowerCase()
}

// Validation rules for job fields
const jobValidationRules = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isString()
    .withMessage('Title must be a string'),

  body('company')
    .notEmpty()
    .withMessage('Company is required')
    .isString()
    .withMessage('Company must be a string'),

  body('status')
    .isIn(['applied', 'interview', 'offer'])
    .withMessage('Status must be applied, interview, or offer'),

  body('jobLink').optional().isURL().withMessage('jobLink must be a valid URL'),
  body('platform')
    .optional()
    .isString()
    .withMessage('Platform must be a string'),
  body('notes').optional().isString().withMessage('Notes must be a string'),
  body('datePosted')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('datePosted must be a valid date'),
  body('deadline')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('deadline must be a valid date'),
  body('dateApplied')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('dateApplied must be a valid date'),
]

// Utility to handle validation errors
const handleValidation = (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
}

// ✅ Protected GET jobs (only for logged-in user)
// router.get('/', authMiddleware, async (req, res) => {
//   const jobs = await Job.find({ userId: req.user.id, isDeleted: false })
//   res.json(jobs)
// })
const jobPatchValidationRules = [
  body('title').optional().isString().withMessage('Title must be a string'),
  body('company').optional().isString().withMessage('Company must be a string'),
  body('status')
    .optional()
    .isIn(['applied', 'interview', 'offer'])
    .withMessage('Invalid status'),
  body('jobLink').optional().isURL().withMessage('jobLink must be a valid URL'),
  body('platform').optional().isString(),
  body('notes').optional().isString(),
  body('datePosted').optional().isISO8601().toDate(),
  body('deadline').optional().isISO8601().toDate(),
  body('dateApplied').optional().isISO8601().toDate(),
]

router.get('/', authMiddleware, async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = Math.min(parseInt(req.query.limit) || 10, 50)

  const skip = (page - 1) * limit

  const filter = {
    userId: req.user.id,
    isDeleted: false,
  }
  const { status, platform, search } = req.query

  if (status) filter.status = status
  if (platform) filter.platform = platform

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
    ]
  }

  const jobs = await Job.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)

  const total = await Job.countDocuments(filter)

  res.json({
    data: jobs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  })
})
// ✅ Protected GET single job by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      userId: req.user.id,
      isDeleted: false,
    })

    if (!job) {
      return res.status(404).json({ error: 'Job not found' })
    }

    res.json(job)
  } catch {
    res.status(400).json({ error: 'Invalid job ID' })
  }
})

// ✅ Protected POST create job
router.post('/', authMiddleware, jobValidationRules, async (req, res) => {
  const invalid = handleValidation(req, res)
  if (invalid) return

  try {
    if (req.body.platform) {
      req.body.platform = normalizePlatform(req.body.platform)
    }
    const exists = await Job.findOne({
      userId: req.user.id,
      title: req.body.title,
      company: req.body.company,
      isDeleted: false,
    })

    if (exists) {
      return res.status(409).json({
        error: 'Duplicate job entry detected',
      })
    }

    const job = await Job.create({ ...req.body, userId: req.user.id })
    res.status(201).json(job)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// ✅ Protected PUT update job
// router.put('/:id', authMiddleware, jobValidationRules, async (req, res) => {
//   const invalid = handleValidation(req, res)
//   if (invalid) return

//   try {
//     const job = await Job.findOneAndUpdate(
//       { _id: req.params.id, userId: req.user.id, isDeleted: false }, //

//       req.body,
//       { new: true, runValidators: true }
//     )
//     if (!job) return res.status(404).json({ error: 'Job not found' })
//     res.json(job)
//   } catch (err) {
//     res.status(400).json({ error: err.message })
//   }
// })
router.put('/:id', authMiddleware, jobValidationRules, async (req, res) => {
  const invalid = handleValidation(req, res)
  if (invalid) return

  try {
    if (req.body.platform) {
      req.body.platform = normalizePlatform(req.body.platform)
    }

    // Find job belonging to the user
    const job = await Job.findOne({
      _id: req.params.id,
      userId: req.user.id,
      isDeleted: false,
    })

    if (!job) {
      return res.status(404).json({ error: 'Job not found' })
    }

    // Validate status transition
    if (
      req.body.status &&
      !isValidStatusTransition(job.status, req.body.status)
    ) {
      return res.status(400).json({
        error: `Invalid status transition from ${job.status} to ${req.body.status}`,
      })
    }

    // Apply updates
    Object.assign(job, req.body)

    // Track status history
    if (req.body.status && req.body.status !== job.status) {
      job.statusHistory.push({ status: req.body.status })
    }

    await job.save()
    res.json(job)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})
// ✅ Protected PATCH job (partial update)
router.patch(
  '/:id',
  authMiddleware,
  jobPatchValidationRules,
  async (req, res) => {
    const invalid = handleValidation(req, res)
    if (invalid) return

    try {
      const job = await Job.findOneAndUpdate(
        {
          _id: req.params.id,
          userId: req.user.id,
          isDeleted: false,
        },
        { $set: req.body },
        { new: true, runValidators: true }
      )

      if (!job) {
        return res.status(404).json({ error: 'Job not found' })
      }

      res.json(job)
    } catch (err) {
      res.status(400).json({ error: err.message })
    }
  }
)

// ✅ Protected DELETE job
router.delete('/:id', authMiddleware, async (req, res) => {
  const job = await Job.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { isDeleted: true },
    { new: true }
  )

  if (!job) return res.status(404).json({ error: 'Job not found' })

  res.json({ message: 'Job soft-deleted' })
})

export default router
