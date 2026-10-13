export function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next)
}

export function notFound(req, res) {
  res.status(404).json({ error: 'Route not found' })
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err)

  const status = Number.isInteger(err.status) ? err.status : 500
  if (status >= 500) {
    console.error('Request failed', { method: req.method, path: req.originalUrl, name: err.name })
  }

  const message = err.type === 'entity.parse.failed'
    ? 'Invalid JSON payload'
    : status >= 500 ? 'Internal server error' : err.message || 'Request failed'
  return res.status(status).json({ error: message })
}
