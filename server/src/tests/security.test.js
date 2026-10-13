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
  await mongoose.connect(mongoServer.getUri())
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

beforeEach(async () => {
  await Promise.all([User.deleteMany({}), Job.deleteMany({})])
})

function tokenFor(user, options = {}) {
  return jwt.sign({ sub: user.id, ...options.payload }, process.env.JWT_SECRET, {
    expiresIn: options.expiresIn || '1h',
  })
}

async function createUser(email, role = 'user') {
  return User.create({ name: email.split('@')[0], email, password: 'password123', role })
}

const auth = (token) => ({ Authorization: `Bearer ${token}` })

describe('authentication security', () => {
  test('rejects missing, invalid, and expired JWTs', async () => {
    const user = await createUser('jwt@test.com')
    const expired = tokenFor(user, { expiresIn: '-1s' })
    expect((await request(app).get('/api/jobs')).status).toBe(401)
    expect((await request(app).get('/api/jobs').set(auth('invalid'))).status).toBe(401)
    expect((await request(app).get('/api/jobs').set(auth(expired))).status).toBe(401)
  })

  test('uses the current database role and revokes stale admin access', async () => {
    const admin = await createUser('admin-revoked@test.com', 'admin')
    const token = tokenFor(admin, { payload: { role: 'admin' } })
    expect((await request(app).get('/api/admin/stats').set(auth(token))).status).toBe(200)
    await User.updateOne({ _id: admin.id }, { role: 'user' })
    expect((await request(app).get('/api/admin/stats').set(auth(token))).status).toBe(403)
  })

  test('validates registration and never accepts a public admin role', async () => {
    const invalid = await request(app).post('/api/auth/register').send({ name: '', email: 'bad', password: '123' })
    expect(invalid.status).toBe(400)

    const created = await request(app).post('/api/auth/register').send({
      name: 'Public User', email: 'public@test.com', password: 'password123', role: 'admin',
    })
    expect(created.status).toBe(201)
    expect((await User.findOne({ email: 'public@test.com' })).role).toBe('user')
  })
})

describe('job ownership and mass assignment', () => {
  test('ignores protected fields on create and update', async () => {
    const owner = await createUser('owner@test.com')
    const attacker = await createUser('attacker@test.com')
    const token = tokenFor(owner)
    const created = await request(app).post('/api/jobs').set(auth(token)).send({
      title: 'Engineer', company: 'Safe Co', status: 'applied',
      userId: attacker.id, isDeleted: true, statusHistory: [{ status: 'offer' }],
      createdAt: '2000-01-01',
    })
    expect(created.status).toBe(201)
    expect(created.body.userId).toBe(owner.id)
    expect(created.body.isDeleted).toBe(false)
    expect(created.body.statusHistory).toHaveLength(1)
    expect(created.body.statusHistory[0].status).toBe('applied')

    const updated = await request(app).patch(`/api/jobs/${created.body._id}`).set(auth(token)).send({
      notes: 'Allowed', userId: attacker.id, isDeleted: true, statusHistory: [{ status: 'offer' }],
    })
    expect(updated.status).toBe(200)
    expect(updated.body.userId).toBe(owner.id)
    expect(updated.body.isDeleted).toBe(false)
    expect(updated.body.statusHistory).toHaveLength(1)
  })

  test('prevents one user from reading, updating, or deleting another user job', async () => {
    const owner = await createUser('owner2@test.com')
    const other = await createUser('other@test.com')
    const job = await Job.create({ userId: owner.id, title: 'Private', company: 'Secret', status: 'applied' })
    const headers = auth(tokenFor(other))
    expect((await request(app).get(`/api/jobs/${job.id}`).set(headers)).status).toBe(404)
    expect((await request(app).patch(`/api/jobs/${job.id}`).set(headers).send({ notes: 'Changed' })).status).toBe(404)
    expect((await request(app).delete(`/api/jobs/${job.id}`).set(headers)).status).toBe(404)
  })
})

describe('job validation and status history', () => {
  test('validates IDs, pagination, and search length', async () => {
    const user = await createUser('validation@test.com')
    const headers = auth(tokenFor(user))
    expect((await request(app).get('/api/jobs/not-an-id').set(headers)).status).toBe(400)
    expect((await request(app).get('/api/jobs?page=0').set(headers)).status).toBe(400)
    expect((await request(app).get('/api/jobs?limit=51').set(headers)).status).toBe(400)
    expect((await request(app).get(`/api/jobs?search=${'a'.repeat(101)}`).set(headers)).status).toBe(400)
  })

  test('treats regex metacharacters as literal search text', async () => {
    const user = await createUser('search@test.com')
    await Job.create({ userId: user.id, title: 'Normal role', company: 'Company', status: 'applied' })
    const result = await request(app).get('/api/jobs?search=.*').set(auth(tokenFor(user)))
    expect(result.status).toBe(200)
    expect(result.body.data).toHaveLength(0)
  })

  test('records real transitions once and rejects backwards transitions', async () => {
    const user = await createUser('status@test.com')
    const job = await Job.create({ userId: user.id, title: 'Role', company: 'Company', status: 'applied' })
    const headers = auth(tokenFor(user))

    const interview = await request(app).patch(`/api/jobs/${job.id}`).set(headers).send({ status: 'interview' })
    expect(interview.status).toBe(200)
    expect(interview.body.statusHistory.map((item) => item.status)).toEqual(['applied', 'interview'])

    const repeated = await request(app).patch(`/api/jobs/${job.id}`).set(headers).send({ status: 'interview' })
    expect(repeated.body.statusHistory).toHaveLength(2)

    const backwards = await request(app).patch(`/api/jobs/${job.id}`).set(headers).send({ status: 'applied' })
    expect(backwards.status).toBe(400)

    const offer = await request(app).patch(`/api/jobs/${job.id}`).set(headers).send({ status: 'offer' })
    expect(offer.status).toBe(200)
    expect(offer.body.statusHistory.map((item) => item.status)).toEqual(['applied', 'interview', 'offer'])
  })
})

describe('HTTP boundary controls', () => {
  test('allows configured CORS origins and rejects unapproved origins', async () => {
    const allowed = await request(app).get('/api/health').set('Origin', 'http://localhost:5173')
    expect(allowed.status).toBe(200)
    expect(allowed.headers['access-control-allow-origin']).toBe('http://localhost:5173')

    const blocked = await request(app).get('/api/health').set('Origin', 'https://evil.example')
    expect(blocked.status).toBe(403)
  })

  test('returns safe JSON for malformed request bodies', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{broken')
    expect(response.status).toBe(400)
    expect(response.body).toEqual({ error: 'Invalid JSON payload' })
  })

  test('rate limits repeated failed login attempts', async () => {
    const responses = []
    for (let attempt = 0; attempt < 12; attempt += 1) {
      responses.push(await request(app).post('/api/auth/login').send({ email: 'missing@test.com', password: 'wrong-password' }))
    }
    expect(responses.some((response) => response.status === 429)).toBe(true)
    expect(responses.at(-1).body.error).toMatch(/too many attempts/i)
  })
})
