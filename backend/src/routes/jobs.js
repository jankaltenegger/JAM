import express from 'express'
import Joi from 'joi'
import { databaseService } from '../services/index.js'
import { logger } from '../utils/logger.js'

const router = express.Router()

// Validation schemas
const createJobSchema = Joi.object({
  title: Joi.string().required(),
  company: Joi.string().required(),
  company_url: Joi.string().uri().optional(),
  job_url: Joi.string().uri().required(),
  location: Joi.object({
    country: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional()
  }).optional(),
  is_remote: Joi.boolean().default(false),
  description: Joi.string().optional(),
  job_type: Joi.string().valid('fulltime', 'parttime', 'internship', 'contract').required(),
  job_function: Joi.object({
    interval: Joi.string().valid('yearly', 'monthly', 'weekly', 'daily', 'hourly').optional(),
    min_amount: Joi.number().optional(),
    max_amount: Joi.number().optional(),
    currency: Joi.string().default('USD'),
    salary_source: Joi.string().valid('direct_data', 'description').optional()
  }).optional(),
  date_posted: Joi.string().isoDate().required(),
  emails: Joi.array().items(Joi.string().email()).optional(),
  job_level: Joi.string().optional(),
  company_industry: Joi.string().optional(),
  company_country: Joi.string().optional(),
  company_addresses: Joi.array().items(Joi.string()).optional(),
  company_employees_label: Joi.string().optional(),
  company_revenue_label: Joi.string().optional(),
  company_description: Joi.string().optional(),
  company_logo: Joi.string().uri().optional(),
  skills: Joi.array().items(Joi.string()).optional(),
  experience_range: Joi.string().optional(),
  company_rating: Joi.number().min(0).max(5).optional(),
  company_reviews_count: Joi.number().integer().min(0).optional(),
  vacancy_count: Joi.number().integer().min(0).optional(),
  status: Joi.string().valid('discovered', 'applied', 'interview', 'offer', 'rejected').default('discovered')
})

const updateJobSchema = Joi.object({
  status: Joi.string().valid('discovered', 'applied', 'interview', 'offer', 'rejected').optional(),
  applied_at: Joi.string().isoDate().optional(),
  interview_date: Joi.string().isoDate().optional(),
  notes: Joi.string().optional()
})

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  status: Joi.string().valid('discovered', 'applied', 'interview', 'offer', 'rejected').optional(),
  search: Joi.string().optional(),
  job_type: Joi.string().valid('fulltime', 'parttime', 'internship', 'contract').optional(),
  is_remote: Joi.boolean().optional(),
  company: Joi.string().optional(),
  location: Joi.string().optional()
})

/**
 * GET /api/jobs
 * Get job applications with pagination and filtering
 */
router.get('/', async (req, res) => {
  try {
    // Validate query parameters
    const { error, value } = querySchema.validate(req.query)
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message
      })
    }

    const { page, limit, ...filters } = value

    // Get job applications from database
    const result = await databaseService.getJobApplications(page, limit, filters)

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    })

  } catch (error) {
    logger.error('Failed to fetch job applications:', error)
    res.status(500).json({
      error: 'Database Error',
      message: error.message
    })
  }
})

/**
 * GET /api/jobs/stats
 * Get job application statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await databaseService.getStats()
    
    res.json({
      success: true,
      stats: {
        total: stats.total || 0,
        applied: stats.applied || 0,
        interviews: stats.interviews || 0,
        offers: stats.offers || 0
      }
    })

  } catch (error) {
    logger.error('Failed to fetch job stats:', error)
    res.status(500).json({
      error: 'Database Error',
      message: error.message,
      stats: {
        total: 0,
        applied: 0,
        interviews: 0,
        offers: 0
      }
    })
  }
})

/**
 * GET /api/jobs/:id
 * Get a specific job application by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    // Get single job from database
    const result = await databaseService.getJobApplications(1, 1, { id })
    
    if (!result.data || result.data.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Job application not found'
      })
    }

    res.json({
      success: true,
      data: result.data[0]
    })

  } catch (error) {
    logger.error('Failed to fetch job application:', error)
    res.status(500).json({
      error: 'Database Error',
      message: error.message
    })
  }
})

/**
 * POST /api/jobs
 * Create a new job application
 */
router.post('/', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = createJobSchema.validate(req.body)
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message
      })
    }

    // Add job to database
    const jobId = await databaseService.addJobApplication(value)

    logger.info('Job application created:', { jobId, company: value.company, title: value.title })

    res.status(201).json({
      success: true,
      data: { id: jobId, ...value }
    })

  } catch (error) {
    logger.error('Failed to create job application:', error)
    res.status(500).json({
      error: 'Database Error',
      message: error.message
    })
  }
})

/**
 * PUT /api/jobs/:id
 * Update a job application
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    // Validate request body
    const { error, value } = updateJobSchema.validate(req.body)
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message
      })
    }

    // Update job in database
    const success = await databaseService.updateJobStatus(id, value.status, value)

    if (!success) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Job application not found'
      })
    }

    logger.info('Job application updated:', { jobId: id, ...value })

    res.json({
      success: true,
      message: 'Job application updated successfully'
    })

  } catch (error) {
    logger.error('Failed to update job application:', error)
    res.status(500).json({
      error: 'Database Error',
      message: error.message
    })
  }
})

/**
 * DELETE /api/jobs/:id
 * Delete a job application (soft delete by setting status)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    // Soft delete by updating status
    const success = await databaseService.updateJobStatus(id, 'deleted')

    if (!success) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Job application not found'
      })
    }

    logger.info('Job application deleted:', { jobId: id })

    res.json({
      success: true,
      message: 'Job application deleted successfully'
    })

  } catch (error) {
    logger.error('Failed to delete job application:', error)
    res.status(500).json({
      error: 'Database Error',
      message: error.message
    })
  }
})

/**
 * POST /api/jobs/bulk
 * Create multiple job applications at once
 */
router.post('/bulk', async (req, res) => {
  try {
    const jobs = req.body.jobs || []
    
    if (!Array.isArray(jobs) || jobs.length === 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Request must contain a non-empty jobs array'
      })
    }

    const results = []
    let successCount = 0
    let errorCount = 0

    for (const job of jobs) {
      try {
        const { error, value } = createJobSchema.validate(job)
        if (error) {
          results.push({
            success: false,
            error: error.details[0].message,
            jobData: job
          })
          errorCount++
          continue
        }

        const jobId = await databaseService.addJobApplication(value)
        results.push({
          success: true,
          jobId,
          jobData: value
        })
        successCount++

      } catch (dbError) {
        results.push({
          success: false,
          error: dbError.message,
          jobData: job
        })
        errorCount++
      }
    }

    logger.info('Bulk job creation completed:', { 
      total: jobs.length, 
      success: successCount, 
      errors: errorCount 
    })

    res.json({
      success: errorCount === 0,
      summary: {
        total: jobs.length,
        created: successCount,
        errors: errorCount
      },
      results
    })

  } catch (error) {
    logger.error('Bulk job creation failed:', error)
    res.status(500).json({
      error: 'Server Error',
      message: error.message
    })
  }
})

export default router