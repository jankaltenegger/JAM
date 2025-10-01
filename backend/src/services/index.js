import { JobScrapingService } from './jobScrapingService.js'
import { AutomationService } from './automationService.js'
import { RealMastraService } from './realMastraService.js'
import { databaseService } from '../../../shared/database/service.mjs'
import { logger } from '../utils/logger.js'

// Service instances
export { databaseService }
export let jobScrapingService
export let automationService  
export let mastraService

/**
 * Initialize all backend services
 */
export async function initializeServices() {
  try {
    logger.info('Initializing backend services...')
    
    // Initialize database
    logger.info('Initializing database...')
    await databaseService.init()
    
    // Initialize job scraping service (JobSpy integration)
    jobScrapingService = new JobScrapingService()
    await jobScrapingService.initialize()
    
    // Initialize automation service (Stagehand integration)
    automationService = new AutomationService()
    await automationService.initialize()
    
    // Initialize workflow orchestration (Real Mastra integration)
    mastraService = new RealMastraService()
    await mastraService.initialize()
    
    logger.info('✅ All services initialized successfully')
    
  } catch (error) {
    logger.error('❌ Failed to initialize services:', error)
    throw error
  }
}

/**
 * Health check for all services
 */
export async function checkServicesHealth() {
  const health = {
    jobScraping: 'unknown',
    automation: 'unknown', 
    mastra: 'unknown',
    timestamp: new Date().toISOString()
  }
  
  try {
    // Check job scraping service
    health.jobScraping = await jobScrapingService?.healthCheck() ? 'healthy' : 'unhealthy'
  } catch (error) {
    health.jobScraping = 'error'
    logger.error('Job scraping service health check failed:', error)
  }
  
  try {
    // Check automation service
    health.automation = await automationService?.healthCheck() ? 'healthy' : 'unhealthy'
  } catch (error) {
    health.automation = 'error'
    logger.error('Automation service health check failed:', error)
  }
  
  try {
    // Check Mastra service
    health.mastra = await mastraService?.healthCheck() ? 'healthy' : 'unhealthy'
  } catch (error) {
    health.mastra = 'error'
    logger.error('Mastra service health check failed:', error)
  }
  
  return health
}