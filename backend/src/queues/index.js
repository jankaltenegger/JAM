import { logger } from '../utils/logger.js'

/**
 * Job Queue System for JAM Backend
 * Handles background tasks and job processing
 */

class JobQueue {
  constructor() {
    this.jobs = new Map()
    this.workers = new Map()
    this.isRunning = false
  }

  /**
   * Add a job to the queue
   */
  async addJob(jobType, data, options = {}) {
    const jobId = `${jobType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const job = {
      id: jobId,
      type: jobType,
      data,
      status: 'pending',
      priority: options.priority || 1,
      maxRetries: options.maxRetries || 3,
      retries: 0,
      createdAt: new Date(),
      ...options
    }

    this.jobs.set(jobId, job)
    logger.info(`Job added to queue: ${jobType}`, { jobId, priority: job.priority })
    
    // Process immediately if queue is running
    if (this.isRunning) {
      setImmediate(() => this.processJobs())
    }

    return jobId
  }

  /**
   * Process pending jobs
   */
  async processJobs() {
    if (!this.isRunning) return

    const pendingJobs = Array.from(this.jobs.values())
      .filter(job => job.status === 'pending')
      .sort((a, b) => b.priority - a.priority) // Higher priority first

    for (const job of pendingJobs) {
      try {
        await this.processJob(job)
      } catch (error) {
        logger.error(`Failed to process job ${job.id}:`, error)
      }
    }
  }

  /**
   * Process a single job
   */
  async processJob(job) {
    const worker = this.workers.get(job.type)
    if (!worker) {
      logger.error(`No worker found for job type: ${job.type}`)
      job.status = 'failed'
      job.error = `No worker found for job type: ${job.type}`
      return
    }

    job.status = 'processing'
    job.startedAt = new Date()
    
    logger.info(`Processing job: ${job.type}`, { jobId: job.id })

    try {
      const result = await worker(job.data, job)
      
      job.status = 'completed'
      job.completedAt = new Date()
      job.result = result
      
      logger.info(`Job completed: ${job.type}`, { jobId: job.id })
      
    } catch (error) {
      job.retries++
      
      if (job.retries >= job.maxRetries) {
        job.status = 'failed'
        job.error = error.message
        job.failedAt = new Date()
        logger.error(`Job failed permanently: ${job.type}`, { jobId: job.id, error: error.message })
      } else {
        job.status = 'pending'
        job.nextRetryAt = new Date(Date.now() + (job.retries * 5000)) // Exponential backoff
        logger.warn(`Job failed, will retry: ${job.type}`, { 
          jobId: job.id, 
          retry: job.retries, 
          maxRetries: job.maxRetries,
          error: error.message 
        })
      }
    }
  }

  /**
   * Register a worker for a job type
   */
  registerWorker(jobType, workerFunction) {
    this.workers.set(jobType, workerFunction)
    logger.info(`Worker registered for job type: ${jobType}`)
  }

  /**
   * Start the queue processor
   */
  start() {
    if (this.isRunning) return
    
    this.isRunning = true
    logger.info('Job queue started')
    
    // Process jobs every 5 seconds
    this.processingInterval = setInterval(() => {
      this.processJobs()
    }, 5000)
  }

  /**
   * Stop the queue processor
   */
  stop() {
    if (!this.isRunning) return
    
    this.isRunning = false
    
    if (this.processingInterval) {
      clearInterval(this.processingInterval)
      this.processingInterval = null
    }
    
    logger.info('Job queue stopped')
  }

  /**
   * Get queue statistics
   */
  getStats() {
    const jobs = Array.from(this.jobs.values())
    
    return {
      total: jobs.length,
      pending: jobs.filter(j => j.status === 'pending').length,
      processing: jobs.filter(j => j.status === 'processing').length,
      completed: jobs.filter(j => j.status === 'completed').length,
      failed: jobs.filter(j => j.status === 'failed').length,
      workers: Array.from(this.workers.keys())
    }
  }
}

// Create singleton job queue instance
const jobQueue = new JobQueue()

/**
 * Setup job queues and register workers
 */
export async function setupJobQueues() {
  try {
    logger.info('Setting up job queues...')

    // Register workers for different job types
    
    // Job scraping worker
    jobQueue.registerWorker('job-scraping', async (data, job) => {
      const { query, location, limit, sites } = data
      // This would integrate with JobScrapingService
      logger.info('Mock job scraping started', { query, location, limit })
      
      // Simulate scraping delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock result
      return {
        query,
        location,
        jobsFound: Math.floor(Math.random() * 50) + 10,
        sites: sites || ['linkedin', 'indeed'],
        timestamp: new Date().toISOString()
      }
    })

    // Auto-apply worker
    jobQueue.registerWorker('auto-apply', async (data, job) => {
      const { jobId, userProfile } = data
      // This would integrate with AutomationService
      logger.info('Mock auto-apply started', { jobId })
      
      // Simulate application delay
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      return {
        jobId,
        status: 'applied',
        appliedAt: new Date().toISOString()
      }
    })

    // Workflow execution worker
    jobQueue.registerWorker('workflow', async (data, job) => {
      const { workflowName, params } = data
      // This would integrate with MastraService
      logger.info('Mock workflow started', { workflowName })
      
      // Simulate workflow delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      return {
        workflowName,
        status: 'completed',
        result: `Mock result for ${workflowName}`,
        executedAt: new Date().toISOString()
      }
    })

    // Email notification worker
    jobQueue.registerWorker('email-notification', async (data, job) => {
      const { recipient, subject, type } = data
      logger.info('Mock email notification', { recipient, subject, type })
      
      // Mock email sending delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      return {
        recipient,
        subject,
        sent: true,
        sentAt: new Date().toISOString()
      }
    })

    // Start the queue processor
    jobQueue.start()
    
    logger.info('✅ Job queues setup completed')
    
  } catch (error) {
    logger.error('❌ Failed to setup job queues:', error)
    throw error
  }
}

/**
 * Get the job queue instance
 */
export function getJobQueue() {
  return jobQueue
}

/**
 * Add a job to the queue (convenience function)
 */
export async function addJob(jobType, data, options = {}) {
  return jobQueue.addJob(jobType, data, options)
}

/**
 * Get queue statistics
 */
export function getQueueStats() {
  return jobQueue.getStats()
}

/**
 * Cleanup job queues
 */
export async function cleanupJobQueues() {
  jobQueue.stop()
  logger.info('Job queues cleaned up')
}