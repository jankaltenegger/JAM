const Database = require('better-sqlite3')
const path = require('path')
const fs = require('fs')

/**
 * Database service for JAM application
 * Shared between Electron main process and backend server
 */
class DatabaseService {
  constructor() {
    this.db = null
    this.isInitialized = false
  }

  /**
   * Initialize the database
   */
  async init(dbPath = null) {
    try {
      // Use provided path or default to user data directory
      const databasePath = dbPath || this.getDefaultDatabasePath()
      
      // Ensure directory exists
      const dbDir = path.dirname(databasePath)
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true })
      }

      // Initialize database
      this.db = new Database(databasePath)
      this.db.pragma('journal_mode = WAL')
      this.db.pragma('foreign_keys = ON')

      // Create tables
      await this.createTables()
      
      this.isInitialized = true
      console.log('Database initialized successfully at:', databasePath)
      return true
    } catch (error) {
      console.error('Database initialization failed:', error)
      this.isInitialized = false
      return false
    }
  }

  /**
   * Get default database path
   */
  getDefaultDatabasePath() {
    // For Electron app, use userData directory
    // For backend server, use relative path
    const isElectron = typeof process !== 'undefined' && process.versions && process.versions.electron
    
    if (isElectron) {
      const { app } = require('electron')
      return path.join(app.getPath('userData'), 'jam.db')
    } else {
      return path.join(__dirname, '../../data/jam.db')
    }
  }

  /**
   * Create database tables
   */
  async createTables() {
    const schemaPath = path.join(__dirname, 'schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    // Execute schema
    this.db.exec(schema)
  }

  /**
   * Get all job applications with pagination
   */
  getJobApplications(page = 1, limit = 20, filters = {}) {
    if (!this.isInitialized || !this.db) {
      throw new Error('Database not initialized')
    }

    try {
      const offset = (page - 1) * limit
      let whereClause = 'WHERE 1=1'
      const params = {}

      // Apply filters
      if (filters.status) {
        whereClause += ' AND status = $status'
        params.status = filters.status
      }

      if (filters.search) {
        whereClause += ' AND (title LIKE $search OR company LIKE $search)'
        params.search = `%${filters.search}%`
      }

      if (filters.job_type) {
        whereClause += ' AND job_type = $job_type'
        params.job_type = filters.job_type
      }

      if (filters.is_remote !== undefined) {
        whereClause += ' AND is_remote = $is_remote'
        params.is_remote = filters.is_remote ? 1 : 0
      }

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM job_applications 
        ${whereClause}
      `
      const countResult = this.db.prepare(countQuery).get(params)
      const total = countResult.total

      // Get paginated results
      const dataQuery = `
        SELECT ja.*, 
               GROUP_CONCAT(s.name) as skills,
               GROUP_CONCAT(jae.email) as emails,
               GROUP_CONCAT(jaa.address) as addresses
        FROM job_applications ja
        LEFT JOIN job_application_skills js ON ja.id = js.job_application_id
        LEFT JOIN skills s ON js.skill_id = s.id
        LEFT JOIN job_application_emails jae ON ja.id = jae.job_application_id
        LEFT JOIN job_application_addresses jaa ON ja.id = jaa.job_application_id
        ${whereClause}
        GROUP BY ja.id
        ORDER BY ja.date_posted DESC, ja.created_at DESC
        LIMIT $limit OFFSET $offset
      `

      const stmt = this.db.prepare(dataQuery)
      const applications = stmt.all({ ...params, limit, offset })

      // Transform results
      const transformedApplications = applications.map(this.transformJobApplication)

      return {
        data: transformedApplications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    } catch (error) {
      console.error('Error fetching job applications:', error)
      throw error
    }
  }

  /**
   * Transform database row to JobApplication interface
   */
  transformJobApplication(row) {
    return {
      id: row.id,
      title: row.title,
      company: row.company,
      company_url: row.company_url,
      job_url: row.job_url,
      location: {
        country: row.location_country,
        city: row.location_city,
        state: row.location_state
      },
      is_remote: Boolean(row.is_remote),
      description: row.description,
      job_type: row.job_type,
      job_function: row.salary_min || row.salary_max ? {
        interval: row.salary_interval || 'yearly',
        min_amount: row.salary_min,
        max_amount: row.salary_max,
        currency: row.salary_currency,
        salary_source: row.salary_source
      } : undefined,
      date_posted: row.date_posted,
      emails: row.emails ? row.emails.split(',') : [],
      job_level: row.job_level,
      company_industry: row.company_industry,
      company_country: row.company_country,
      company_addresses: row.addresses ? row.addresses.split(',') : [],
      company_employees_label: row.company_employees_label,
      company_revenue_label: row.company_revenue_label,
      company_description: row.company_description,
      company_logo: row.company_logo,
      skills: row.skills ? row.skills.split(',') : [],
      experience_range: row.experience_range,
      company_rating: row.company_rating,
      company_reviews_count: row.company_reviews_count,
      vacancy_count: row.vacancy_count,
      status: row.status || 'discovered',
      applied_at: row.applied_at,
      interview_date: row.interview_date,
      notes: row.notes,
      created_at: row.created_at,
      updated_at: row.updated_at
    }
  }

  /**
   * Add a new job application
   */
  addJobApplication(jobData) {
    if (!this.isInitialized || !this.db) {
      throw new Error('Database not initialized')
    }

    const transaction = this.db.transaction((job) => {
      // Insert main job record
      const insertJob = this.db.prepare(`
        INSERT INTO job_applications (
          id, title, company, company_url, job_url,
          location_country, location_city, location_state,
          is_remote, description, job_type,
          salary_min, salary_max, salary_interval, salary_currency, salary_source,
          date_posted, job_level, company_industry, company_country,
          company_employees_label, company_revenue_label, company_description,
          company_logo, experience_range, company_rating, company_reviews_count,
          vacancy_count, status
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
      `)

      const jobId = job.id || `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      insertJob.run([
        jobId,
        job.title,
        job.company,
        job.company_url,
        job.job_url,
        job.location?.country,
        job.location?.city,
        job.location?.state,
        job.is_remote ? 1 : 0,
        job.description,
        job.job_type,
        job.job_function?.min_amount,
        job.job_function?.max_amount,
        job.job_function?.interval,
        job.job_function?.currency,
        job.job_function?.salary_source,
        job.date_posted,
        job.job_level,
        job.company_industry,
        job.company_country,
        job.company_employees_label,
        job.company_revenue_label,
        job.company_description,
        job.company_logo,
        job.experience_range,
        job.company_rating,
        job.company_reviews_count,
        job.vacancy_count,
        job.status || 'discovered'
      ])

      // Insert skills
      if (job.skills && job.skills.length > 0) {
        const insertSkill = this.db.prepare('INSERT OR IGNORE INTO skills (skill_name) VALUES (?)')
        const insertJobSkill = this.db.prepare('INSERT INTO job_application_skills (job_application_id, skill_id) VALUES (?, ?)')
        const getSkillId = this.db.prepare('SELECT id FROM skills WHERE skill_name = ?')

        for (const skill of job.skills) {
          insertSkill.run(skill)
          const skillRow = getSkillId.get(skill)
          insertJobSkill.run(jobId, skillRow.id)
        }
      }

      // Insert emails
      if (job.emails && job.emails.length > 0) {
        const insertEmail = this.db.prepare('INSERT OR IGNORE INTO emails (email) VALUES (?)')
        const insertJobEmail = this.db.prepare('INSERT INTO job_emails (job_id, email_id) VALUES (?, ?)')
        const getEmailId = this.db.prepare('SELECT id FROM emails WHERE email = ?')

        for (const email of job.emails) {
          insertEmail.run(email)
          const emailRow = getEmailId.get(email)
          insertJobEmail.run(jobId, emailRow.id)
        }
      }

      // Insert addresses
      if (job.company_addresses && job.company_addresses.length > 0) {
        const insertAddress = this.db.prepare('INSERT OR IGNORE INTO addresses (address) VALUES (?)')
        const insertJobAddress = this.db.prepare('INSERT INTO job_addresses (job_id, address_id) VALUES (?, ?)')
        const getAddressId = this.db.prepare('SELECT id FROM addresses WHERE address = ?')

        for (const address of job.company_addresses) {
          insertAddress.run(address)
          const addressRow = getAddressId.get(address)
          insertJobAddress.run(jobId, addressRow.id)
        }
      }

      return jobId
    })

    return transaction(jobData)
  }

  /**
   * Update job application status
   */
  updateJobStatus(jobId, status, additionalData = {}) {
    if (!this.isInitialized || !this.db) {
      throw new Error('Database not initialized')
    }

    const updateFields = ['status = ?']
    const values = [status]

    if (additionalData.applied_at) {
      updateFields.push('applied_at = ?')
      values.push(additionalData.applied_at)
    }

    if (additionalData.interview_date) {
      updateFields.push('interview_date = ?')
      values.push(additionalData.interview_date)
    }

    if (additionalData.notes) {
      updateFields.push('notes = ?')
      values.push(additionalData.notes)
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP')
    values.push(jobId)

    const query = `UPDATE job_applications SET ${updateFields.join(', ')} WHERE id = ?`
    const stmt = this.db.prepare(query)
    const result = stmt.run(values)

    return result.changes > 0
  }

  /**
   * Get job application statistics
   */
  getStats() {
    if (!this.isInitialized || !this.db) {
      return {
        total: 0,
        applied: 0,
        interviews: 0,
        offers: 0
      }
    }

    try {
      const stats = this.db.prepare(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'applied' THEN 1 ELSE 0 END) as applied,
          SUM(CASE WHEN status = 'interview' THEN 1 ELSE 0 END) as interviews,
          SUM(CASE WHEN status = 'offer' THEN 1 ELSE 0 END) as offers
        FROM job_applications
      `).get()

      return stats
    } catch (error) {
      console.error('Error getting stats:', error)
      return {
        total: 0,
        applied: 0,
        interviews: 0,
        offers: 0
      }
    }
  }

  /**
   * Close database connection
   */
  close() {
    if (this.db) {
      this.db.close()
      this.db = null
      this.isInitialized = false
    }
  }
}

// Export singleton instance
const databaseService = new DatabaseService()
module.exports = { databaseService, DatabaseService }