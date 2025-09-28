import { spawn } from 'child_process'
import { promises as fs } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { logger } from '../utils/logger.js'

/**
 * Job Scraping Service using JobSpy Python library
 * Handles job scraping from various job boards
 */
export class JobScrapingService {
  constructor() {
    this.pythonPath = process.env.PYTHON_PATH || 'python3'
    this.timeout = (process.env.JOBSPY_TIMEOUT_SECONDS || 60) * 1000
    this.maxJobsPerScrape = process.env.MAX_JOBS_PER_SCRAPE || 50
    this.supportedSites = (process.env.SUPPORTED_JOB_SITES || 'linkedin,indeed,glassdoor').split(',')
    this.scriptsDir = path.join(process.cwd(), 'src', 'python')
    this.tempDir = path.join(process.cwd(), 'temp')
    this.pythonAvailable = true
  }

  async initialize() {
    try {
      logger.info('Initializing Job Scraping Service...')
      
      // Ensure directories exist
      await fs.mkdir(this.scriptsDir, { recursive: true })
      await fs.mkdir(this.tempDir, { recursive: true })
      
      // Create the Python JobSpy wrapper script
      await this.createJobSpyScript()
      
      // Test Python and JobSpy installation (optional)
      try {
        await this.testPythonEnvironment()
        logger.info('✅ Python environment available')
      } catch (error) {
        logger.warn('⚠️ Python environment not available - JobSpy scraping will be disabled:', error.message)
        this.pythonAvailable = false
      }
      
      logger.info('✅ Job Scraping Service initialized')
    } catch (error) {
      logger.error('❌ Failed to initialize Job Scraping Service:', error)
      throw error
    }
  }

  /**
   * Scrape jobs from specified job boards
   */
  async scrapeJobs(params = {}) {
    const {
      query = 'software engineer',
      location = 'United States',
      sites = ['linkedin', 'indeed'],
      maxJobs = this.maxJobsPerScrape,
      jobType = 'fulltime',
      experienceLevel = null
    } = params

    const scrapeId = uuidv4()
    const outputFile = path.join(this.tempDir, `jobs_${scrapeId}.json`)

    try {
      logger.info(`Starting job scrape: ${scrapeId}`, { query, location, sites, maxJobs })

      // If Python is not available, return mock data
      if (!this.pythonAvailable) {
        logger.warn('Python environment not available, returning mock job data')
        return this.generateMockJobData(params)
      }

      const result = await this.runJobSpyScript({
        query,
        location, 
        sites: sites.filter(site => this.supportedSites.includes(site)),
        maxJobs,
        jobType,
        experienceLevel,
        outputFile
      })

      // Read and parse results
      const jobsData = await fs.readFile(outputFile, 'utf8')
      const jobs = JSON.parse(jobsData)

      // Clean up temp file
      await fs.unlink(outputFile).catch(() => {}) // Ignore cleanup errors

      logger.info(`✅ Job scrape completed: ${scrapeId}`, { 
        jobsFound: jobs.length,
        sites: sites
      })

      return {
        scrapeId,
        jobs: jobs.map(job => this.transformJobData(job)),
        metadata: {
          query,
          location,
          sites,
          scrapedAt: new Date().toISOString(),
          totalJobs: jobs.length
        }
      }

    } catch (error) {
      logger.error(`❌ Job scrape failed: ${scrapeId}`, error)
      
      // Clean up temp file on error
      await fs.unlink(outputFile).catch(() => {})
      
      throw error
    }
  }

  /**
   * Transform JobSpy data to match our JobApplication interface
   */
  transformJobData(job) {
    return {
      title: job.title || '',
      company: job.company || '',
      company_url: job.company_url || null,
      job_url: job.job_url || job.link || '',
      location: {
        country: job.country || null,
        city: job.city || null, 
        state: job.state || null
      },
      is_remote: job.is_remote || job.location?.toLowerCase().includes('remote') || false,
      description: job.description || job.job_function || '',
      job_type: this.normalizeJobType(job.job_type),
      job_function: job.compensation ? {
        interval: job.compensation.interval || 'yearly',
        min_amount: job.compensation.min_amount || null,
        max_amount: job.compensation.max_amount || null,
        currency: job.compensation.currency || 'USD',
        salary_source: 'direct_data'
      } : null,
      date_posted: job.date_posted || new Date().toISOString(),
      
      // Site-specific fields
      job_level: job.job_level || null,
      company_industry: job.company_industry || null,
      company_country: job.company_country || null,
      company_addresses: job.company_addresses || null,
      company_employees_label: job.company_num_employees || null,
      company_revenue_label: job.company_revenue || null,
      company_description: job.company_description || null,
      company_logo: job.company_logo || null,
      
      skills: job.skills || null,
      experience_range: job.seniority_level || null,
      company_rating: job.company_rating || null,
      company_reviews_count: job.company_reviews_count || null,
      
      // Application tracking (defaults for scraped jobs)
      lastUpdated: new Date().toISOString(),
      status: 'not_applied',
      priority: 'medium',
      source: job.site || 'unknown'
    }
  }

  normalizeJobType(jobType) {
    if (!jobType) return 'fulltime'
    
    const normalized = jobType.toLowerCase().replace(/[\s-_]/g, '')
    
    if (normalized.includes('fulltime') || normalized.includes('full')) return 'fulltime'
    if (normalized.includes('parttime') || normalized.includes('part')) return 'parttime' 
    if (normalized.includes('contract') || normalized.includes('contractor')) return 'contract'
    if (normalized.includes('intern') || normalized.includes('internship')) return 'internship'
    
    return 'fulltime' // default
  }

  /**
   * Run the JobSpy Python script
   */
  async runJobSpyScript(params) {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(this.scriptsDir, 'job_scraper.py')
      const args = [
        scriptPath,
        '--query', params.query,
        '--location', params.location,
        '--sites', params.sites.join(','),
        '--max-jobs', params.maxJobs.toString(),
        '--output', params.outputFile
      ]

      if (params.jobType) {
        args.push('--job-type', params.jobType)
      }

      if (params.experienceLevel) {
        args.push('--experience-level', params.experienceLevel)
      }

      logger.debug('Executing JobSpy script:', { command: this.pythonPath, args })

      const process = spawn(this.pythonPath, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: this.scriptsDir
      })

      let stdout = ''
      let stderr = ''

      process.stdout.on('data', (data) => {
        stdout += data.toString()
      })

      process.stderr.on('data', (data) => {
        stderr += data.toString()
      })

      process.on('close', (code) => {
        if (code === 0) {
          logger.debug('JobSpy script completed successfully')
          resolve({ stdout, stderr })
        } else {
          logger.error('JobSpy script failed:', { code, stdout, stderr })
          reject(new Error(`JobSpy script exited with code ${code}: ${stderr}`))
        }
      })

      process.on('error', (error) => {
        logger.error('Failed to start JobSpy script:', error)
        reject(error)
      })

      // Set timeout
      const timer = setTimeout(() => {
        process.kill('SIGTERM')
        reject(new Error(`JobSpy script timed out after ${this.timeout}ms`))
      }, this.timeout)

      process.on('close', () => clearTimeout(timer))
    })
  }

  /**
   * Create the Python JobSpy wrapper script
   */
  async createJobSpyScript() {
    const scriptContent = `#!/usr/bin/env python3
"""
JobSpy Wrapper Script for JAM Backend
Scrapes jobs using the JobSpy library and outputs to JSON
"""

import sys
import json
import argparse
from datetime import datetime
try:
    from JobSpy import scrape_jobs
except ImportError:
    print("Error: JobSpy library not found. Install with: pip install JobSpy", file=sys.stderr)
    sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description='Scrape jobs using JobSpy')
    parser.add_argument('--query', required=True, help='Job search query')
    parser.add_argument('--location', required=True, help='Job location')
    parser.add_argument('--sites', required=True, help='Comma-separated job sites')
    parser.add_argument('--max-jobs', type=int, default=50, help='Maximum jobs to scrape')
    parser.add_argument('--job-type', help='Job type filter')
    parser.add_argument('--experience-level', help='Experience level filter')
    parser.add_argument('--output', required=True, help='Output JSON file path')
    
    args = parser.parse_args()
    
    try:
        print(f"Starting job scrape: {args.query} in {args.location}", file=sys.stderr)
        
        # Convert sites string to list
        sites = [site.strip() for site in args.sites.split(',')]
        
        # Scrape jobs
        jobs_df = scrape_jobs(
            site_name=sites,
            search_term=args.query,
            location=args.location,
            results_wanted=args.max_jobs,
            hours_old=168,  # Jobs from last week
            country_indeed='USA'  # Default country
        )
        
        if jobs_df is not None and not jobs_df.empty:
            # Convert DataFrame to JSON-serializable format
            jobs_data = []
            for _, row in jobs_df.iterrows():
                job_data = {
                    'title': str(row.get('title', '')),
                    'company': str(row.get('company', '')),
                    'company_url': str(row.get('company_url', '')) if pd.notna(row.get('company_url')) else None,
                    'job_url': str(row.get('job_url', '')),
                    'location': str(row.get('location', '')),
                    'city': str(row.get('city', '')) if pd.notna(row.get('city')) else None,
                    'state': str(row.get('state', '')) if pd.notna(row.get('state')) else None,
                    'country': str(row.get('country', '')) if pd.notna(row.get('country')) else None,
                    'is_remote': bool(row.get('is_remote', False)),
                    'job_type': str(row.get('job_type', '')) if pd.notna(row.get('job_type')) else None,
                    'date_posted': str(row.get('date_posted', datetime.now().isoformat())),
                    'description': str(row.get('description', ''))[:5000],  # Limit description length
                    'site': str(row.get('site', 'unknown')),
                    'job_level': str(row.get('job_level', '')) if pd.notna(row.get('job_level')) else None,
                    'company_industry': str(row.get('company_industry', '')) if pd.notna(row.get('company_industry')) else None,
                    'salary_source': str(row.get('salary_source', '')) if pd.notna(row.get('salary_source')) else None,
                }
                
                # Handle compensation data
                if pd.notna(row.get('min_amount')) or pd.notna(row.get('max_amount')):
                    job_data['compensation'] = {
                        'min_amount': float(row.get('min_amount')) if pd.notna(row.get('min_amount')) else None,
                        'max_amount': float(row.get('max_amount')) if pd.notna(row.get('max_amount')) else None,
                        'interval': str(row.get('interval', 'yearly')) if pd.notna(row.get('interval')) else 'yearly',
                        'currency': str(row.get('currency', 'USD')) if pd.notna(row.get('currency')) else 'USD'
                    }
                
                jobs_data.append(job_data)
            
            # Write to output file
            with open(args.output, 'w', encoding='utf-8') as f:
                json.dump(jobs_data, f, indent=2, ensure_ascii=False)
            
            print(f"Successfully scraped {len(jobs_data)} jobs", file=sys.stderr)
            
        else:
            print("No jobs found", file=sys.stderr)
            # Write empty array
            with open(args.output, 'w', encoding='utf-8') as f:
                json.dump([], f)
                
    except Exception as e:
        print(f"Error during job scraping: {str(e)}", file=sys.stderr)
        # Write empty array on error
        with open(args.output, 'w', encoding='utf-8') as f:
            json.dump([], f)
        sys.exit(1)

if __name__ == '__main__':
    try:
        import pandas as pd
        main()
    except ImportError:
        print("Error: Required libraries not found. Install with: pip install JobSpy pandas", file=sys.stderr)
        sys.exit(1)
`

    const scriptPath = path.join(this.scriptsDir, 'job_scraper.py')
    await fs.writeFile(scriptPath, scriptContent, 'utf8')
    
    // Make script executable
    await fs.chmod(scriptPath, 0o755)
    
    logger.info('Created JobSpy wrapper script:', scriptPath)
  }

  /**
   * Test Python environment and JobSpy installation
   */
  async testPythonEnvironment() {
    return new Promise((resolve, reject) => {
      const process = spawn(this.pythonPath, ['-c', 'import JobSpy, pandas; print("OK")'])
      
      let output = ''
      process.stdout.on('data', (data) => {
        output += data.toString()
      })
      
      process.on('close', (code) => {
        if (code === 0 && output.includes('OK')) {
          logger.info('✅ Python environment and JobSpy verified')
          resolve(true)
        } else {
          const error = `Python environment test failed. Make sure JobSpy and pandas are installed: pip install JobSpy pandas`
          logger.error(error)
          reject(new Error(error))
        }
      })
      
      process.on('error', (error) => {
        logger.error('Python executable not found:', error)
        reject(error)
      })
    })
  }

  /**
   * Generate mock job data for testing/demo purposes
   */
  generateMockJobData(params = {}) {
    const { query, location, sites, maxJobs } = params
    const jobCount = Math.min(maxJobs || 10, 25)
    
    const mockJobs = []
    const companies = ['Google', 'Microsoft', 'Apple', 'Amazon', 'Meta', 'Netflix', 'Tesla', 'Airbnb', 'Uber', 'Spotify']
    const titles = ['Software Engineer', 'Senior Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'DevOps Engineer', 'Data Scientist', 'Product Manager']
    const levels = ['Entry Level', 'Mid Level', 'Senior Level', 'Lead', 'Principal']
    
    for (let i = 0; i < jobCount; i++) {
      const company = companies[Math.floor(Math.random() * companies.length)]
      const title = titles[Math.floor(Math.random() * titles.length)]
      const level = levels[Math.floor(Math.random() * levels.length)]
      
      mockJobs.push({
        id: `mock_job_${Date.now()}_${i}`,
        title: `${level} ${title}`,
        company,
        company_url: `https://${company.toLowerCase()}.com`,
        job_url: `https://jobs.${company.toLowerCase()}.com/job/${i}`,
        location: {
          country: 'United States',
          city: location?.includes(',') ? location.split(',')[0] : 'San Francisco',
          state: location?.includes(',') ? location.split(',')[1] : 'CA'
        },
        is_remote: Math.random() > 0.5,
        description: `We are looking for a ${title} to join our team at ${company}. This is a great opportunity to work with cutting-edge technology and make a real impact.`,
        job_type: 'fulltime',
        job_function: {
          interval: 'yearly',
          min_amount: 80000 + (Math.random() * 120000),
          max_amount: 120000 + (Math.random() * 180000),
          currency: 'USD',
          salary_source: 'direct_data'
        },
        date_posted: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        job_level: level,
        company_industry: 'Technology',
        skills: ['JavaScript', 'Python', 'React', 'Node.js', 'SQL'].slice(0, Math.floor(Math.random() * 5) + 1),
        status: 'discovered'
      })
    }
    
    logger.info(`Generated ${jobCount} mock jobs for: ${query} in ${location}`)
    
    return {
      jobs: mockJobs,
      metadata: {
        query,
        location,
        sites: sites || ['mock'],
        total_jobs: jobCount,
        scrape_date: new Date().toISOString(),
        mock_data: true
      }
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      if (this.pythonAvailable) {
        await this.testPythonEnvironment()
      }
      return {
        status: 'healthy',
        pythonAvailable: this.pythonAvailable,
        supportedSites: this.supportedSites
      }
    } catch (error) {
      logger.error('Job scraping service health check failed:', error)
      return false
    }
  }
}