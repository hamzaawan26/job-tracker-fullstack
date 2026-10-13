import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import app from '../app.js'
import User from '../models/User.js'
import Job from '../models/Job.js'

let mongoServer

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  const uri = mongoServer.getUri()
  
  // Disconnect if already connected
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect()
  }
  
  await mongoose.connect(uri)
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

beforeEach(async () => {
  await User.deleteMany({})
  await Job.deleteMany({})
})

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, name: user.name, role: user.role },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  )
}

describe('Admin Routes', () => {
  describe('Authorization', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/admin/users')
      expect(res.status).toBe(401)
    })

    it('should return 403 for non-admin users', async () => {
      const user = await User.create({
        name: 'Regular User',
        email: 'user@test.com',
        password: 'password123',
        role: 'user'
      })
      const token = generateToken(user)

      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(403)
      expect(res.body.error).toBe('Admin access required')
    })

    it('should allow admin users access', async () => {
      const admin = await User.create({
        name: 'Admin User',
        email: 'admin@test.com',
        password: 'password123',
        role: 'admin'
      })
      const token = generateToken(admin)

      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
    })
  })

  describe('GET /api/admin/users', () => {
    it('should return all users without passwords', async () => {
      const admin = await User.create({
        name: 'Admin',
        email: 'admin@test.com',
        password: 'password123',
        role: 'admin'
      })
      await User.create({
        name: 'User 1',
        email: 'user1@test.com',
        password: 'password123'
      })
      await User.create({
        name: 'User 2',
        email: 'user2@test.com',
        password: 'password123'
      })

      const token = generateToken(admin)
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(3)
      expect(res.body[0]).not.toHaveProperty('password')
      expect(res.body[0]).toHaveProperty('email')
      expect(res.body[0]).toHaveProperty('name')
    })
  })

  describe('GET /api/admin/jobs', () => {
    it('should return all jobs with user email populated', async () => {
      const admin = await User.create({
        name: 'Admin',
        email: 'admin@test.com',
        password: 'password123',
        role: 'admin'
      })
      const user = await User.create({
        name: 'Job Owner',
        email: 'owner@test.com',
        password: 'password123'
      })

      await Job.create({
        company: 'Test Company',
        title: 'Developer',
        status: 'applied',
        userId: user._id
      })

      const token = generateToken(admin)
      const res = await request(app)
        .get('/api/admin/jobs')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(1)
      expect(res.body[0].userId.email).toBe('owner@test.com')
    })
  })

  describe('GET /api/admin/stats', () => {
    it('should return platform statistics', async () => {
      const admin = await User.create({
        name: 'Admin',
        email: 'admin@test.com',
        password: 'password123',
        role: 'admin'
      })
      await User.create({
        name: 'User',
        email: 'user@test.com',
        password: 'password123'
      })
      await Job.create({
        company: 'Company 1',
        title: 'Dev',
        status: 'applied',
        userId: admin._id,
        isDeleted: false
      })
      await Job.create({
        company: 'Company 2',
        title: 'Dev',
        status: 'applied',
        userId: admin._id,
        isDeleted: true
      })

      const token = generateToken(admin)
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.totalUsers).toBe(2)
      expect(res.body.totalJobs).toBe(1) // Only non-deleted jobs
    })
  })
})

describe('User Model - Role Field', () => {
  it('should default role to user', async () => {
    const user = await User.create({
      name: 'New User',
      email: 'new@test.com',
      password: 'password123'
    })
    expect(user.role).toBe('user')
  })

  it('should allow admin role', async () => {
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin'
    })
    expect(admin.role).toBe('admin')
  })

  it('should reject invalid roles', async () => {
    await expect(User.create({
      name: 'Invalid',
      email: 'invalid@test.com',
      password: 'password123',
      role: 'superuser'
    })).rejects.toThrow()
  })
})
