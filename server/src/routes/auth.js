import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { body } from 'express-validator'
import User from '../models/User.js'
import { authMiddleware } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/errors.js'
import { loginLimiter, registrationLimiter } from '../middleware/rateLimits.js'
import { validateRequest } from '../middleware/validate.js'

const router = express.Router()
const emailRule = body('email').isString().trim().isEmail().normalizeEmail().withMessage('A valid email is required').isLength({ max: 254 }).withMessage('Email is too long')

router.post('/login', loginLimiter, [
  emailRule,
  body('password').isString().notEmpty().withMessage('Password is required').isLength({ max: 128 }).withMessage('Invalid credentials'),
], validateRequest, asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select('+password')
  const matches = user ? await bcrypt.compare(req.body.password, user.password) : false
  if (!matches) return res.status(400).json({ error: 'Invalid credentials' })

  const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { algorithm: 'HS256', expiresIn: '1h' })
  return res.json({
    message: 'Login successful',
    token,
    user: { id: user.id, name: user.name, email: user.email },
  })
}))

router.post('/register', registrationLimiter, [
  body('name').isString().trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }).withMessage('Name must be 100 characters or fewer'),
  emailRule,
  body('password').isString().isLength({ min: 6, max: 128 }).withMessage('Password must be between 6 and 128 characters'),
], validateRequest, asyncHandler(async (req, res) => {
  const existing = await User.exists({ email: req.body.email })
  if (existing) return res.status(400).json({ error: 'Unable to create account with provided details' })

  const user = await User.create({ name: req.body.name, email: req.body.email, password: req.body.password })
  return res.status(201).json({ message: 'User registered successfully', userId: user.id })
}))

router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: { id: req.user.id, name: req.user.name, email: req.user.email } })
})

export default router
