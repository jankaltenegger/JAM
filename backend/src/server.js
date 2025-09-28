import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { createServer } from 'http'

// Import route modules
import jobRoutes from './routes/jobs.js'
import automationRoutes from './routes/automation.js'
import scrapingRoutes from './routes/scraping.js'
import healthRoutes from './routes/health.js'

// Import services
import { initializeServices } from './services/index.js'
import { setupJobQueues } from './queues/index.js'
import { logger } from './utils/logger.js'
import { errorHandler } from './middleware/errorHandler.js'
import { rateLimiter } from './middleware/rateLimiter.js'

// Load environment variables
dotenv.config()

const app = express()
const server = createServer(app)
const PORT = process.env.PORT || 3001

// Middleware
app.use(helmet())
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Electron and dev server
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(rateLimiter)

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, { 
    ip: req.ip, 
    userAgent: req.get('User-Agent') 
  })
  next()
})

// Routes
app.use('/api/health', healthRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/automation', automationRoutes)
app.use('/api/scraping', scrapingRoutes)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not Found', 
    message: `Route ${req.originalUrl} not found` 
  })
})

// Global error handler
app.use(errorHandler)

// Graceful shutdown
const gracefulShutdown = () => {
  logger.info('Received shutdown signal, closing server gracefully...')
  
  server.close(() => {
    logger.info('HTTP server closed')
    
    // Close database connections, Redis, etc.
    process.exit(0)
  })
  
  // Force close after 30 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down')
    process.exit(1)
  }, 30000)
}

process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)

// Initialize services and start server
async function startServer() {
  try {
    logger.info('Starting JAM Backend Server...')
    
    // Initialize external services
    await initializeServices()
    
    // Setup job queues
    await setupJobQueues()
    
    // Start server
    server.listen(PORT, () => {
      logger.info(`🚀 JAM Backend Server running on http://localhost:${PORT}`)
      logger.info('📊 Available endpoints:')
      logger.info('  • Health: GET /api/health')
      logger.info('  • Jobs: /api/jobs/*')
      logger.info('  • Automation: /api/automation/*') 
      logger.info('  • Scraping: /api/scraping/*')
    })
    
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()