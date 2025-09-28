import express from 'express'
import Joi from 'joi'
import { automationService, mastraService } from '../services/index.js'
import { logger } from '../utils/logger.js'

const router = express.Router()

// Validation schemas
const applyJobSchema = Joi.object({
  jobApplication: Joi.object({
    id: Joi.string().required(),
    job_url: Joi.string().uri().required(),
    title: Joi.string().required(),
    company: Joi.string().required()
  }).required(),
  userProfile: Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(), 
    email: Joi.string().email().required(),
    phone: Joi.string().optional(),
    resumePath: Joi.string().optional(),
    coverLetter: Joi.string().optional(),
    workAuthorized: Joi.string().optional(),
    requiresSponsorship: Joi.string().optional(),
    yearsExperience: Joi.string().optional(),
    skills: Joi.array().items(Joi.string()).optional()
  }).required()
})

const workflowSchema = Joi.object({
  workflowName: Joi.string().required(),
  input: Joi.object().default({}),
  options: Joi.object().default({})
})

/**
 * POST /api/automation/apply-job
 * Auto-apply to a specific job
 */
router.post('/apply-job', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = applyJobSchema.validate(req.body)
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        details: error.details.map(d => d.message)
      })
    }

    const { jobApplication, userProfile } = value

    logger.info('Starting auto-apply process', {
      jobId: jobApplication.id,
      company: jobApplication.company,
      title: jobApplication.title,
      userEmail: userProfile.email
    })

    // Execute auto-apply automation
    const result = await automationService.applyToJob(jobApplication, userProfile)

    res.json({
      success: result.success,
      automationId: result.automationId,
      appliedAt: result.appliedAt,
      steps: result.steps,
      message: result.message || result.error
    })

  } catch (error) {
    logger.error('Auto-apply failed:', error)
    res.status(500).json({
      error: 'Automation Failed',
      message: error.message
    })
  }
})

/**
 * POST /api/automation/workflow
 * Execute a Mastra workflow
 */
router.post('/workflow', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = workflowSchema.validate(req.body)
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        details: error.details.map(d => d.message)
      })
    }

    const { workflowName, input, options } = value

    logger.info('Starting workflow execution', { 
      workflowName,
      inputKeys: Object.keys(input)
    })

    // Execute workflow
    const result = await mastraService.executeWorkflow(workflowName, input, options)

    res.json({
      success: result.success,
      workflowId: result.workflowId,
      duration: result.duration,
      steps: result.steps,
      output: result.output
    })

  } catch (error) {
    logger.error('Workflow execution failed:', error)
    res.status(500).json({
      error: 'Workflow Failed',
      message: error.message
    })
  }
})

/**
 * GET /api/automation/workflows
 * Get available workflows
 */
router.get('/workflows', (req, res) => {
  const workflows = [
    {
      name: 'job-discovery',
      description: 'Scrape and process new job opportunities',
      triggers: ['manual', 'scheduled'],
      estimatedDuration: '2-5 minutes'
    },
    {
      name: 'auto-apply',
      description: 'Automatically apply to selected jobs',
      triggers: ['manual'],
      estimatedDuration: '30-60 seconds per job'
    },
    {
      name: 'smart-job-matching', 
      description: 'Analyze and score job matches',
      triggers: ['job-scraped', 'manual'],
      estimatedDuration: '10-30 seconds per job'
    }
  ]

  res.json({ workflows })
})

/**
 * POST /api/automation/schedule-workflow
 * Schedule a workflow for recurring execution
 */
router.post('/schedule-workflow', async (req, res) => {
  try {
    const { workflowName, schedule, input = {} } = req.body

    if (!workflowName || !schedule) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'workflowName and schedule are required'
      })
    }

    logger.info('Scheduling workflow', { workflowName, schedule })

    const result = await mastraService.scheduleWorkflow(workflowName, schedule, input)

    res.json({
      success: true,
      scheduled: result.scheduled,
      workflowName: result.workflowName,
      schedule: result.schedule
    })

  } catch (error) {
    logger.error('Workflow scheduling failed:', error)
    res.status(500).json({
      error: 'Scheduling Failed',
      message: error.message
    })
  }
})

/**
 * POST /api/automation/screenshot
 * Take a debug screenshot during automation
 */
router.post('/screenshot', async (req, res) => {
  try {
    const { filename = 'debug' } = req.body

    const screenshotPath = await automationService.takeScreenshot(filename)

    res.json({
      success: true,
      screenshotPath,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    logger.error('Screenshot failed:', error)
    res.status(500).json({
      error: 'Screenshot Failed',
      message: error.message
    })
  }
})

/**
 * GET /api/automation/status
 * Get automation service status
 */
router.get('/status', async (req, res) => {
  try {
    const isHealthy = await automationService.healthCheck()
    const mastraHealthy = await mastraService.healthCheck()

    res.json({
      automation: {
        status: isHealthy ? 'healthy' : 'unhealthy',
        initialized: automationService.isInitialized,
        browserHeadless: automationService.headless
      },
      workflows: {
        status: mastraHealthy ? 'healthy' : 'unhealthy',
        initialized: mastraService.isInitialized,
        availableWorkflows: mastraService.workflows?.size || 0
      }
    })

  } catch (error) {
    logger.error('Status check failed:', error)
    res.status(500).json({
      error: 'Status Check Failed',
      message: error.message
    })
  }
})

export default router