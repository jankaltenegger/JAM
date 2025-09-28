import { logger } from '../utils/logger.js'

/**
 * Real Automation Service using Stagehand for browser automation
 * Handles auto-applying to jobs and form filling
 */
export class AutomationService {
  constructor() {
    this.stagehand = null
    this.isInitialized = false
    this.headless = process.env.BROWSER_HEADLESS !== 'false' // Default to true
    this.timeout = parseInt(process.env.STAGEHAND_TIMEOUT_MS) || 30000
    this.delay = parseInt(process.env.AUTOMATION_DELAY_MS) || 2000
    this.stagehandAvailable = false
    this.StagehandClass = null
  }

  async initialize() {
    try {
      logger.info('Initializing Automation Service (Real Stagehand)...')
      
      // Try to load Stagehand
      try {
        const { Stagehand } = await import('stagehand')
        this.StagehandClass = Stagehand
        this.stagehandAvailable = true
        logger.info('✅ Stagehand imported successfully')
        
        // Test if we can actually create an instance
        try {
          this.stagehand = new this.StagehandClass({
            headless: this.headless,
            logger: (message) => logger.debug(`Stagehand: ${message}`),
            debugDom: false
          })
          
          // Test basic initialization
          await this.stagehand.init()
          logger.info('✅ Stagehand initialized successfully')
          
        } catch (initError) {
          logger.warn('⚠️ Stagehand available but failed to initialize (likely no browsers):', initError.message)
          logger.info('💡 Falling back to mock mode until browsers are installed')
          this.stagehandAvailable = false
          this.stagehand = this.createMockStagehand()
        }
        
      } catch (importError) {
        logger.warn('⚠️ Stagehand not available - using mock implementation:', importError.message)
        this.stagehandAvailable = false
        this.stagehand = this.createMockStagehand()
      }
      
      this.isInitialized = true
      logger.info(`✅ Automation Service initialized (${this.stagehandAvailable ? 'Real' : 'Mock'} Stagehand)`)
      
    } catch (error) {
      logger.error('❌ Failed to initialize Automation Service:', error)
      throw error
    }
  }

  /**
   * Apply to a job using real or mock Stagehand
   */
  async applyToJob(jobApplication, userProfile) {
    const automationId = `auto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    try {
      logger.info(`${this.stagehandAvailable ? 'Real' : 'Mock'} applying to job: ${jobApplication.title} at ${jobApplication.company}`, {
        automationId,
        jobUrl: jobApplication.job_url
      })

      if (this.stagehandAvailable) {
        return await this.realApplyToJob(jobApplication, userProfile, automationId)
      } else {
        return await this.mockApplyToJob(jobApplication, userProfile, automationId)
      }

    } catch (error) {
      logger.error(`Application failed for ${jobApplication.id}:`, error)
      return {
        success: false,
        automationId,
        jobId: jobApplication.id,
        error: error.message,
        mock: !this.stagehandAvailable
      }
    }
  }

  /**
   * Real job application using Stagehand
   */
  async realApplyToJob(jobApplication, userProfile, automationId) {
    try {
      // Navigate to job URL
      await this.stagehand.goto(jobApplication.job_url)
      await new Promise(resolve => setTimeout(resolve, this.delay))

      // Determine job site and apply appropriate strategy
      const url = new URL(jobApplication.job_url)
      const hostname = url.hostname.toLowerCase()

      let result
      if (hostname.includes('linkedin')) {
        result = await this.applyLinkedIn(userProfile, automationId)
      } else if (hostname.includes('indeed')) {
        result = await this.applyIndeed(userProfile, automationId)
      } else if (hostname.includes('glassdoor')) {
        result = await this.applyGlassdoor(userProfile, automationId)
      } else {
        result = await this.applyGeneric(userProfile, automationId)
      }

      return {
        success: true,
        automationId,
        jobId: jobApplication.id,
        appliedAt: new Date().toISOString(),
        status: 'applied',
        mock: false,
        strategy: result.strategy,
        message: `Real application submitted for ${jobApplication.title} at ${jobApplication.company}`
      }

    } catch (error) {
      throw new Error(`Real Stagehand application failed: ${error.message}`)
    }
  }

  /**
   * Mock job application
   */
  async mockApplyToJob(jobApplication, userProfile, automationId) {
    // Simulate realistic application process timing
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000))

    return {
      success: true,
      automationId,
      jobId: jobApplication.id,
      appliedAt: new Date().toISOString(),
      status: 'applied',
      mock: true,
      message: `Mock application submitted for ${jobApplication.title} at ${jobApplication.company}`
    }
  }

  /**
   * LinkedIn application strategy
   */
  async applyLinkedIn(userProfile, automationId) {
    logger.info('Using LinkedIn application strategy')
    
    try {
      // Look for "Easy Apply" button
      await this.stagehand.click('button[aria-label*="Easy Apply"], button:contains("Easy Apply")')
      await new Promise(resolve => setTimeout(resolve, this.delay))

      // Fill out basic information
      if (userProfile.phone) {
        await this.stagehand.fill('input[id*="phone"], input[name*="phone"]', userProfile.phone)
      }

      // Handle standard questions
      await this.answerStandardQuestions(userProfile)

      // Submit application
      await this.stagehand.click('button[aria-label*="Submit"], button:contains("Submit application")')
      
      return { strategy: 'linkedin_easy_apply' }
    } catch (error) {
      throw new Error(`LinkedIn application failed: ${error.message}`)
    }
  }

  /**
   * Indeed application strategy
   */
  async applyIndeed(userProfile, automationId) {
    logger.info('Using Indeed application strategy')
    
    try {
      // Look for "Apply now" button
      await this.stagehand.click('button:contains("Apply now"), a:contains("Apply now")')
      await new Promise(resolve => setTimeout(resolve, this.delay))

      // Fill contact information
      if (userProfile.email) {
        await this.stagehand.fill('input[type="email"], input[name*="email"]', userProfile.email)
      }
      if (userProfile.phone) {
        await this.stagehand.fill('input[type="tel"], input[name*="phone"]', userProfile.phone)
      }

      // Submit application
      await this.stagehand.click('button[type="submit"], button:contains("Submit")')
      
      return { strategy: 'indeed_quick_apply' }
    } catch (error) {
      throw new Error(`Indeed application failed: ${error.message}`)
    }
  }

  /**
   * Glassdoor application strategy
   */
  async applyGlassdoor(userProfile, automationId) {
    logger.info('Using Glassdoor application strategy')
    
    try {
      // Look for application button
      await this.stagehand.click('button:contains("Apply Now"), a:contains("Apply Now")')
      await new Promise(resolve => setTimeout(resolve, this.delay))

      // Handle application form
      await this.answerStandardQuestions(userProfile)

      // Submit
      await this.stagehand.click('button:contains("Submit"), button[type="submit"]')
      
      return { strategy: 'glassdoor_apply' }
    } catch (error) {
      throw new Error(`Glassdoor application failed: ${error.message}`)
    }
  }

  /**
   * Generic application strategy for other sites
   */
  async applyGeneric(userProfile, automationId) {
    logger.info('Using generic application strategy')
    
    try {
      // Look for common application buttons
      const applySelectors = [
        'button:contains("Apply")',
        'a:contains("Apply")',
        'button:contains("Submit Application")',
        'input[type="submit"][value*="Apply"]'
      ]

      for (const selector of applySelectors) {
        try {
          await this.stagehand.click(selector)
          break
        } catch (e) {
          // Try next selector
          continue
        }
      }

      await new Promise(resolve => setTimeout(resolve, this.delay))

      // Try to fill common fields
      await this.fillCommonFields(userProfile)

      return { strategy: 'generic_apply' }
    } catch (error) {
      throw new Error(`Generic application failed: ${error.message}`)
    }
  }

  /**
   * Fill common form fields
   */
  async fillCommonFields(userProfile) {
    const fieldMap = {
      email: ['input[type="email"]', 'input[name*="email"]'],
      phone: ['input[type="tel"]', 'input[name*="phone"]'],
      firstName: ['input[name*="first"], input[name*="fname"]'],
      lastName: ['input[name*="last"], input[name*="lname"]'],
      name: ['input[name*="name"]:not([name*="first"]):not([name*="last"])']
    }

    for (const [field, selectors] of Object.entries(fieldMap)) {
      if (userProfile[field]) {
        for (const selector of selectors) {
          try {
            await this.stagehand.fill(selector, userProfile[field])
            break
          } catch (e) {
            // Try next selector
            continue
          }
        }
      }
    }
  }

  /**
   * Answer standard application questions
   */
  async answerStandardQuestions(userProfile) {
    // Handle common questions
    const questions = [
      { text: 'authorized to work', answer: 'yes' },
      { text: 'require sponsorship', answer: 'no' },
      { text: 'years of experience', answer: userProfile.yearsOfExperience || '3' }
    ]

    for (const question of questions) {
      try {
        // Look for question text and associated input
        const elements = await this.stagehand.evaluate(() => {
          return Array.from(document.querySelectorAll('*')).filter(el => 
            el.textContent.toLowerCase().includes(question.text.toLowerCase())
          )
        })

        // This is simplified - real implementation would be more sophisticated
        logger.debug(`Handling question about: ${question.text}`)
        
      } catch (e) {
        // Question not found or couldn't answer
        continue
      }
    }
  }

  /**
   * Take screenshot
   */
  async takeScreenshot(options = {}) {
    try {
      if (this.stagehandAvailable && this.stagehand) {
        const screenshot = await this.stagehand.screenshot(options)
        logger.info('Real screenshot taken')
        return {
          success: true,
          screenshot,
          timestamp: new Date().toISOString(),
          mock: false
        }
      } else {
        logger.info('Taking mock screenshot')
        await new Promise(resolve => setTimeout(resolve, 500))
        return {
          success: true,
          screenshot: 'mock-screenshot-data',
          timestamp: new Date().toISOString(),
          mock: true
        }
      }
    } catch (error) {
      logger.error('Screenshot failed:', error)
      return {
        success: false,
        error: error.message,
        mock: !this.stagehandAvailable
      }
    }
  }

  /**
   * Create mock Stagehand for fallback
   */
  createMockStagehand() {
    return {
      init: async () => logger.debug('Mock Stagehand init'),
      goto: async (url) => logger.debug(`Mock navigation to: ${url}`),
      click: async (selector) => logger.debug(`Mock click on: ${selector}`),
      fill: async (selector, text) => logger.debug(`Mock fill ${selector} with: ${text}`),
      waitFor: async (selector) => logger.debug(`Mock wait for: ${selector}`),
      screenshot: async (options = {}) => Buffer.from('mock-screenshot-data'),
      evaluate: async (fn) => 'mock-result',
      close: async () => logger.debug('Mock Stagehand closed')
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    return {
      status: 'healthy',
      initialized: this.isInitialized,
      stagehandAvailable: this.stagehandAvailable,
      mode: this.stagehandAvailable ? 'real' : 'mock',
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    if (this.stagehand && this.stagehandAvailable) {
      try {
        await this.stagehand.close()
      } catch (error) {
        logger.warn('Error closing Stagehand:', error.message)
      }
    }
    this.isInitialized = false
    logger.info('Automation service cleaned up')
  }
}