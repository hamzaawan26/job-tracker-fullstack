import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import User from '../models/User.js'
import { asyncHandler } from './errors.js'

export const authMiddleware = asyncHandler(async (req, res, next) => {
  const authorization = req.get('authorization')
  if (!authorization?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  const token = authorization.slice(7).trim()
  if (!token) return res.status(401).json({ error: 'Authentication required' })

  let decoded
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] })
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }

  const userId = decoded.sub || decoded.id
  if (!mongoose.isValidObjectId(userId)) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }

  const user = await User.findById(userId).select('_id name email role')
  if (!user) return res.status(401).json({ error: 'Invalid or expired token' })

  req.user = { id: user.id, name: user.name, email: user.email, role: user.role }
  next()
})
