import express from 'express'
import { checkServicesHealth } from '../services/index.js'
import { logger } from '../utils/logger.js'

const router = express.Router()

/**
 * Health check endpoint
 */
router.get('/', async (req, res) => {
  try {
    const health = await checkServicesHealth()
    const overallHealth = Object.values(health)
      .filter(status => status !== health.timestamp)
      .every(status => status === 'healthy')

    res.status(overallHealth ? 200 : 503).json({
      status: overallHealth ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: health,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0'
    })
  } catch (error) {
    logger.error('Health check failed:', error)
    res.status(503).json({
      status: 'error',
      message: 'Health check failed',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * Detailed service status
 */
router.get('/services', async (req, res) => {
  try {
    const health = await checkServicesHealth()
    res.json(health)
  } catch (error) {
    logger.error('Service health check failed:', error)
    res.status(500).json({
      error: 'Service health check failed',
      message: error.message
    })
  }
})

export default router