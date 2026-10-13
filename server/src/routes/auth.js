import express from 'express'
import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { authMiddleware } from '../middleware/auth.js'
const router = express.Router()

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ error: 'Invalid credentials' })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' })

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    )

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (err) {
    return res.status(401).json({
      error: 'Unauthorized',
      reason: err.name === 'TokenExpiredError' ? 'expired' : 'invalid',
    })
  }
})

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    const existing = await User.findOne({ email })
    if (existing)
      return res.status(400).json({ error: 'Email already registered' })

    const user = new User({ name, email, password })
    await user.save()

    res
      .status(201)
      .json({ message: 'User registered successfully', userId: user._id })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/me', authMiddleware, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
      },
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
