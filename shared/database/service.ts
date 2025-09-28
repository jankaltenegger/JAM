import Database from 'better-sqlite3'
import { app } from 'electron'
import path from 'path'
import fs from 'fs'

// Types matching our frontend interface
export interface JobApplication {
  id: string
  title: string
  company: string
  company_url?: string
  job_url: string
  location: {
    country?: string
    city?: string
    state?: string
  }
  is_remote: boolean
  description: string
  job_type: 'fulltime' | 'parttime' | 'internship' | 'contract'
  job_function?: {
    interval: 'yearly' | 'monthly' | 'weekly' | 'daily' | 'hourly'
    min_amount?: number
    max_amount?: number
    currency?: string
    salary_source?: 'direct_data' | 'description'
  }
  date_posted: string
  emails?: string[]
  
  // LinkedIn specific
  job_level?: string
  
  // LinkedIn & Indeed specific
  company_industry?: string
  
  // Indeed specific
  company_country?: string
  company_addresses?: string[]
  company_employees_label?: string
  company_revenue_label?: string
  company_description?: string
  company_logo?: string
  
  // Naukri specific
  skills?: string[]
  experience_range?: string
  company_rating?: number
  company_reviews_count?: number
  vacancy_count?: number
  work_from_home_type?: string
  
  // Application tracking fields
  appliedDate?: string
  responseDate?: string
  lastUpdated: string
  status: 'not_applied' | 'applied' | 'phone_screen' | 'technical_interview' | 'onsite_interview' | 'final_round' | 'offer' | 'rejected'
  notes?: string
  priority?: 'low' | 'medium' | 'high'
  source: string
}

export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}

export interface JobApplicationsResponse {
  jobs: JobApplication[]
  pagination: PaginationInfo
}

class DatabaseService {
  private db: Database.Database | null = null
  private dbPath: string

  constructor() {
    // Store database in user data directory
    const userDataPath = app.getPath('userData')
    this.dbPath = path.join(userDataPath, 'jam-database.sqlite3')
  }

  /**
   * Initialize database connection and create tables
   */
  async initialize(): Promise<void> {
    try {
      // Ensure the directory exists
      const dir = path.dirname(this.dbPath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }

      // Create database connection
      this.db = new Database(this.dbPath)
      
      // Enable foreign keys
      this.db.pragma('foreign_keys = ON')
      
      // Read and execute schema
      const schemaPath = path.join(__dirname, 'schema.sql')
      const schema = fs.readFileSync(schemaPath, 'utf8')
      
      // Split and execute each statement
      const statements = schema.split(';').filter(stmt => stmt.trim().length > 0)
      
      for (const statement of statements) {
        this.db.exec(statement.trim() + ';')
      }

      console.log('Database initialized successfully at:', this.dbPath)
    } catch (error) {
      console.error('Failed to initialize database:', error)
      throw error
    }
  }

  /**
   * Get database instance (ensure it's initialized first)
   */
  private getDb(): Database.Database {
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.')
    }
    return this.db
  }

  /**
   * Close database connection
   */
  close(): void {
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }

  /**
   * Create a new job application
   */
  async createJobApplication(job: Omit<JobApplication, 'id'>): Promise<JobApplication> {
    const db = this.getDb()
    const id = crypto.randomUUID()
    
    const insertStmt = db.prepare(`
      INSERT INTO job_applications (
        id, title, company, company_url, job_url,
        location_country, location_city, location_state, is_remote,
        description, job_type,
        salary_interval, salary_min_amount, salary_max_amount, salary_currency, salary_source,
        date_posted, job_level, company_industry, company_country,
        company_employees_label, company_revenue_label, company_description, company_logo,
        company_rating, company_reviews_count, experience_range, vacancy_count, work_from_home_type,
        applied_date, response_date, last_updated, status, notes, priority, source
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?
      )
    `)

    try {
      // Start transaction
      const transaction = db.transaction(() => {
        // Insert main record
        insertStmt.run(
          id, job.title, job.company, job.company_url, job.job_url,
          job.location.country, job.location.city, job.location.state, job.is_remote ? 1 : 0,
          job.description, job.job_type,
          job.job_function?.interval, job.job_function?.min_amount, job.job_function?.max_amount, 
          job.job_function?.currency, job.job_function?.salary_source,
          job.date_posted, job.job_level, job.company_industry, job.company_country,
          job.company_employees_label, job.company_revenue_label, job.company_description, job.company_logo,
          job.company_rating, job.company_reviews_count, job.experience_range, job.vacancy_count, job.work_from_home_type,
          job.appliedDate, job.responseDate, job.lastUpdated, job.status, job.notes, job.priority, job.source
        )

        // Insert skills
        if (job.skills && job.skills.length > 0) {
          this.insertJobSkills(id, job.skills)
        }

        // Insert emails
        if (job.emails && job.emails.length > 0) {
          this.insertJobEmails(id, job.emails)
        }

        // Insert addresses
        if (job.company_addresses && job.company_addresses.length > 0) {
          this.insertJobAddresses(id, job.company_addresses)
        }
      })

      transaction()
      
      // Return the created job
      return await this.getJobApplication(id)
    } catch (error) {
      console.error('Failed to create job application:', error)
      throw error
    }
  }

  /**
   * Get a single job application by ID
   */
  async getJobApplication(id: string): Promise<JobApplication> {
    const db = this.getDb()
    
    const stmt = db.prepare(`
      SELECT * FROM job_applications WHERE id = ?
    `)
    
    const row = stmt.get(id) as any
    if (!row) {
      throw new Error(`Job application with id ${id} not found`)
    }

    return this.rowToJobApplication(row)
  }

  /**
   * Get paginated job applications with optional filters
   */
  async getJobApplications(
    page: number = 1,
    limit: number = 10,
    status?: string,
    search?: string
  ): Promise<JobApplicationsResponse> {
    const db = this.getDb()
    
    let whereClause = 'WHERE 1=1'
    const params: any[] = []

    // Add status filter
    if (status && status !== 'all') {
      if (status === 'interviews_all') {
        whereClause += ' AND status IN (?, ?, ?, ?)'
        params.push('phone_screen', 'technical_interview', 'onsite_interview', 'final_round')
      } else {
        whereClause += ' AND status = ?'
        params.push(status)
      }
    }

    // Add search filter
    if (search) {
      whereClause += ' AND (title LIKE ? OR company LIKE ?)'
      params.push(`%${search}%`, `%${search}%`)
    }

    // Get total count
    const countStmt = db.prepare(`
      SELECT COUNT(*) as count FROM job_applications ${whereClause}
    `)
    const { count } = countStmt.get(...params) as { count: number }

    // Get paginated results
    const offset = (page - 1) * limit
    const stmt = db.prepare(`
      SELECT * FROM job_applications 
      ${whereClause}
      ORDER BY date_posted DESC, created_at DESC
      LIMIT ? OFFSET ?
    `)
    
    const rows = stmt.all(...params, limit, offset) as any[]
    
    const jobs = await Promise.all(rows.map(row => this.rowToJobApplication(row)))

    return {
      jobs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: limit
      }
    }
  }

  /**
   * Update a job application
   */
  async updateJobApplication(id: string, updates: Partial<JobApplication>): Promise<JobApplication> {
    const db = this.getDb()
    
    // Build dynamic update query
    const updateFields: string[] = []
    const params: any[] = []

    // Map frontend fields to database columns
    const fieldMap: Record<string, string> = {
      title: 'title',
      company: 'company',
      company_url: 'company_url',
      job_url: 'job_url',
      is_remote: 'is_remote',
      description: 'description',
      job_type: 'job_type',
      date_posted: 'date_posted',
      job_level: 'job_level',
      company_industry: 'company_industry',
      company_country: 'company_country',
      company_employees_label: 'company_employees_label',
      company_revenue_label: 'company_revenue_label',
      company_description: 'company_description',
      company_logo: 'company_logo',
      company_rating: 'company_rating',
      company_reviews_count: 'company_reviews_count',
      experience_range: 'experience_range',
      vacancy_count: 'vacancy_count',
      work_from_home_type: 'work_from_home_type',
      appliedDate: 'applied_date',
      responseDate: 'response_date',
      lastUpdated: 'last_updated',
      status: 'status',
      notes: 'notes',
      priority: 'priority',
      source: 'source'
    }

    // Handle simple field updates
    for (const [key, value] of Object.entries(updates)) {
      if (fieldMap[key]) {
        updateFields.push(`${fieldMap[key]} = ?`)
        params.push(value)
      }
    }

    // Handle location updates
    if (updates.location) {
      if (updates.location.country !== undefined) {
        updateFields.push('location_country = ?')
        params.push(updates.location.country)
      }
      if (updates.location.city !== undefined) {
        updateFields.push('location_city = ?')
        params.push(updates.location.city)
      }
      if (updates.location.state !== undefined) {
        updateFields.push('location_state = ?')
        params.push(updates.location.state)
      }
    }

    // Handle job_function updates
    if (updates.job_function) {
      if (updates.job_function.interval !== undefined) {
        updateFields.push('salary_interval = ?')
        params.push(updates.job_function.interval)
      }
      if (updates.job_function.min_amount !== undefined) {
        updateFields.push('salary_min_amount = ?')
        params.push(updates.job_function.min_amount)
      }
      if (updates.job_function.max_amount !== undefined) {
        updateFields.push('salary_max_amount = ?')
        params.push(updates.job_function.max_amount)
      }
      if (updates.job_function.currency !== undefined) {
        updateFields.push('salary_currency = ?')
        params.push(updates.job_function.currency)
      }
      if (updates.job_function.salary_source !== undefined) {
        updateFields.push('salary_source = ?')
        params.push(updates.job_function.salary_source)
      }
    }

    if (updateFields.length === 0) {
      throw new Error('No valid fields to update')
    }

    const updateStmt = db.prepare(`
      UPDATE job_applications 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `)

    try {
      const transaction = db.transaction(() => {
        updateStmt.run(...params, id)

        // Update related tables if provided
        if (updates.skills !== undefined) {
          // Delete existing skills and insert new ones
          db.prepare('DELETE FROM job_application_skills WHERE job_application_id = ?').run(id)
          if (updates.skills.length > 0) {
            this.insertJobSkills(id, updates.skills)
          }
        }

        if (updates.emails !== undefined) {
          // Delete existing emails and insert new ones
          db.prepare('DELETE FROM job_application_emails WHERE job_application_id = ?').run(id)
          if (updates.emails.length > 0) {
            this.insertJobEmails(id, updates.emails)
          }
        }

        if (updates.company_addresses !== undefined) {
          // Delete existing addresses and insert new ones
          db.prepare('DELETE FROM job_application_addresses WHERE job_application_id = ?').run(id)
          if (updates.company_addresses.length > 0) {
            this.insertJobAddresses(id, updates.company_addresses)
          }
        }
      })

      transaction()

      return await this.getJobApplication(id)
    } catch (error) {
      console.error('Failed to update job application:', error)
      throw error
    }
  }

  /**
   * Delete a job application
   */
  async deleteJobApplication(id: string): Promise<void> {
    const db = this.getDb()
    
    const stmt = db.prepare('DELETE FROM job_applications WHERE id = ?')
    const result = stmt.run(id)
    
    if (result.changes === 0) {
      throw new Error(`Job application with id ${id} not found`)
    }
  }

  // Helper methods

  private insertJobSkills(jobId: string, skills: string[]): void {
    const db = this.getDb()
    
    for (const skillName of skills) {
      // Insert skill if it doesn't exist
      const insertSkillStmt = db.prepare('INSERT OR IGNORE INTO skills (name) VALUES (?)')
      insertSkillStmt.run(skillName)
      
      // Get skill ID
      const getSkillStmt = db.prepare('SELECT id FROM skills WHERE name = ?')
      const skill = getSkillStmt.get(skillName) as { id: number }
      
      // Link skill to job
      const linkStmt = db.prepare('INSERT INTO job_application_skills (job_application_id, skill_id) VALUES (?, ?)')
      linkStmt.run(jobId, skill.id)
    }
  }

  private insertJobEmails(jobId: string, emails: string[]): void {
    const db = this.getDb()
    const stmt = db.prepare('INSERT INTO job_application_emails (job_application_id, email) VALUES (?, ?)')
    
    for (const email of emails) {
      stmt.run(jobId, email)
    }
  }

  private insertJobAddresses(jobId: string, addresses: string[]): void {
    const db = this.getDb()
    const stmt = db.prepare('INSERT INTO job_application_addresses (job_application_id, address) VALUES (?, ?)')
    
    for (const address of addresses) {
      stmt.run(jobId, address)
    }
  }

  private async rowToJobApplication(row: any): Promise<JobApplication> {
    const db = this.getDb()
    
    // Get related skills
    const skillsStmt = db.prepare(`
      SELECT s.name 
      FROM skills s 
      JOIN job_application_skills jas ON s.id = jas.skill_id 
      WHERE jas.job_application_id = ?
    `)
    const skills = skillsStmt.all(row.id).map((s: any) => s.name)

    // Get related emails
    const emailsStmt = db.prepare('SELECT email FROM job_application_emails WHERE job_application_id = ?')
    const emails = emailsStmt.all(row.id).map((e: any) => e.email)

    // Get related addresses
    const addressesStmt = db.prepare('SELECT address FROM job_application_addresses WHERE job_application_id = ?')
    const addresses = addressesStmt.all(row.id).map((a: any) => a.address)

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
      job_function: row.salary_interval ? {
        interval: row.salary_interval,
        min_amount: row.salary_min_amount,
        max_amount: row.salary_max_amount,
        currency: row.salary_currency,
        salary_source: row.salary_source
      } : undefined,
      date_posted: row.date_posted,
      emails: emails.length > 0 ? emails : undefined,
      job_level: row.job_level,
      company_industry: row.company_industry,
      company_country: row.company_country,
      company_addresses: addresses.length > 0 ? addresses : undefined,
      company_employees_label: row.company_employees_label,
      company_revenue_label: row.company_revenue_label,
      company_description: row.company_description,
      company_logo: row.company_logo,
      skills: skills.length > 0 ? skills : undefined,
      experience_range: row.experience_range,
      company_rating: row.company_rating,
      company_reviews_count: row.company_reviews_count,
      vacancy_count: row.vacancy_count,
      work_from_home_type: row.work_from_home_type,
      appliedDate: row.applied_date,
      responseDate: row.response_date,
      lastUpdated: row.last_updated,
      status: row.status,
      notes: row.notes,
      priority: row.priority,
      source: row.source
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService()