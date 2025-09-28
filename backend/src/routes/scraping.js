import express from 'express'
import Joi from 'joi'
import { jobScrapingService } from '../services/index.js'
import { logger } from '../utils/logger.js'

const router = express.Router()

// Validation schemas
const scrapeJobsSchema = Joi.object({
  query: Joi.string().required().min(1).max(200),
  location: Joi.string().default('United States').max(100),
  sites: Joi.array().items(Joi.string().valid('linkedin', 'indeed', 'glassdoor', 'ziprecruiter')).default(['linkedin', 'indeed']),
  maxJobs: Joi.number().integer().min(1).max(200).default(50),
  jobType: Joi.string().valid('fulltime', 'parttime', 'contract', 'internship').default('fulltime'),
  experienceLevel: Joi.string().valid('entry', 'mid', 'senior').optional()
})

/**
 * POST /api/scraping/jobs
 * Scrape jobs from job boards
 */
router.post('/jobs', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = scrapeJobsSchema.validate(req.body)
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        details: error.details.map(d => d.message)
      })
    }

    const { query, location, sites, maxJobs, jobType, experienceLevel } = value

    logger.info('Starting job scraping request', { 
      query, 
      location, 
      sites, 
      maxJobs,
      ip: req.ip 
    })

    // Execute job scraping
    const result = await jobScrapingService.scrapeJobs({
      query,
      location,
      sites,
      maxJobs,
      jobType,
      experienceLevel
    })

    res.json({
      success: true,
      scrapeId: result.scrapeId,
      jobs: result.jobs,
      metadata: result.metadata
    })

  } catch (error) {
    logger.error('Job scraping failed:', error)
    res.status(500).json({
      error: 'Scraping Failed',
      message: error.message
    })
  }
})

/**
 * GET /api/scraping/supported-sites
 * Get list of supported job sites
 */
router.get('/supported-sites', (req, res) => {
  const supportedSites = [
    {
      name: 'LinkedIn',
      key: 'linkedin',
      description: 'Professional networking and job platform',
      features: ['Easy Apply', 'Company Pages', 'Salary Data']
    },
    {
      name: 'Indeed',
      key: 'indeed', 
      description: 'Global job search engine',
      features: ['Company Reviews', 'Salary Estimates', 'Job Alerts']
    },
    {
      name: 'Glassdoor',
      key: 'glassdoor',
      description: 'Job and company review platform',
      features: ['Company Reviews', 'Salary Data', 'Interview Reviews']
    },
    {
      name: 'ZipRecruiter',
      key: 'ziprecruiter',
      description: 'AI-powered job matching platform', 
      features: ['One-Click Apply', 'Job Matching', 'Mobile Alerts']
    }
  ]

  res.json({
    supportedSites,
    totalSites: supportedSites.length
  })
})

/**
 * POST /api/scraping/test-python
 * Test Python environment and JobSpy installation
 */
router.post('/test-python', async (req, res) => {
  try {
    const isHealthy = await jobScrapingService.healthCheck()
    
    res.json({
      success: isHealthy,
      pythonPath: jobScrapingService.pythonPath,
      message: isHealthy ? 'Python environment is ready' : 'Python environment check failed'
    })

  } catch (error) {
    logger.error('Python environment test failed:', error)
    res.status(500).json({
      success: false,
      error: 'Python Test Failed',
      message: error.message
    })
  }
})

export default router