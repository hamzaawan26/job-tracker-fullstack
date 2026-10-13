const DEFAULT_DEV_ORIGINS = ['http://localhost:5173', 'http://localhost:4173']

export function getCorsOrigins() {
  const configured = process.env.CORS_ORIGINS?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

  if (configured?.length) return configured
  return process.env.NODE_ENV === 'production' ? [] : DEFAULT_DEV_ORIGINS
}

export function validateEnvironment() {
  const missing = ['MONGO_URI', 'JWT_SECRET'].filter((name) => !process.env[name])
  if (missing.length) throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production')
  }
  if (process.env.NODE_ENV === 'production' && getCorsOrigins().length === 0) {
    throw new Error('CORS_ORIGINS must contain at least one approved production origin')
  }
}
