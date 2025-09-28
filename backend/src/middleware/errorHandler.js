import { logger } from '../utils/logger.js'

/**
 * Global error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  })

  // Determine error type and status code
  let statusCode = 500
  let message = 'Internal Server Error'

  if (err.name === 'ValidationError') {
    statusCode = 400
    message = 'Validation Error'
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401
    message = 'Unauthorized'
  } else if (err.name === 'CastError') {
    statusCode = 400
    message = 'Invalid Request'
  } else if (err.statusCode) {
    statusCode = err.statusCode
    message = err.message
  }

  // Send error response
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && {
      details: err.message,
      stack: err.stack
    })
  })
}