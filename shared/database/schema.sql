-- JAM (Job Application Manager) Database Schema
-- SQLite database schema for job applications tracking

-- Main job applications table
CREATE TABLE IF NOT EXISTS job_applications (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    company_url TEXT,
    job_url TEXT NOT NULL,
    
    -- Location as separate columns (normalized from nested object)
    location_country TEXT,
    location_city TEXT,
    location_state TEXT,
    is_remote BOOLEAN NOT NULL DEFAULT 0,
    
    description TEXT,
    job_type TEXT NOT NULL CHECK(job_type IN ('fulltime', 'parttime', 'internship', 'contract')),
    
    -- Job function/salary info as separate columns
    salary_interval TEXT CHECK(salary_interval IN ('yearly', 'monthly', 'weekly', 'daily', 'hourly')),
    salary_min_amount REAL,
    salary_max_amount REAL,
    salary_currency TEXT DEFAULT 'USD',
    salary_source TEXT CHECK(salary_source IN ('direct_data', 'description')),
    
    date_posted TEXT NOT NULL, -- ISO date string
    
    -- Company details
    job_level TEXT,
    company_industry TEXT,
    company_country TEXT,
    company_employees_label TEXT,
    company_revenue_label TEXT,
    company_description TEXT,
    company_logo TEXT,
    company_rating REAL,
    company_reviews_count INTEGER,
    
    -- Job specifics
    experience_range TEXT,
    vacancy_count INTEGER,
    work_from_home_type TEXT,
    
    -- Application tracking
    applied_date TEXT, -- ISO date string
    response_date TEXT, -- ISO date string
    last_updated TEXT NOT NULL, -- ISO date string
    status TEXT NOT NULL DEFAULT 'not_applied' CHECK(
        status IN ('not_applied', 'applied', 'phone_screen', 'technical_interview', 'onsite_interview', 'final_round', 'offer', 'rejected')
    ),
    notes TEXT,
    priority TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high')),
    source TEXT NOT NULL,
    
    -- Timestamps
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Skills table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Job application skills junction table
CREATE TABLE IF NOT EXISTS job_application_skills (
    job_application_id TEXT NOT NULL,
    skill_id INTEGER NOT NULL,
    PRIMARY KEY (job_application_id, skill_id),
    FOREIGN KEY (job_application_id) REFERENCES job_applications(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- Emails table (one-to-many relationship)
CREATE TABLE IF NOT EXISTS job_application_emails (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_application_id TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (job_application_id) REFERENCES job_applications(id) ON DELETE CASCADE
);

-- Company addresses table (one-to-many relationship)
CREATE TABLE IF NOT EXISTS job_application_addresses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_application_id TEXT NOT NULL,
    address TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (job_application_id) REFERENCES job_applications(id) ON DELETE CASCADE
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_company ON job_applications(company);
CREATE INDEX IF NOT EXISTS idx_job_applications_date_posted ON job_applications(date_posted);
CREATE INDEX IF NOT EXISTS idx_job_applications_priority ON job_applications(priority);
CREATE INDEX IF NOT EXISTS idx_job_applications_source ON job_applications(source);
CREATE INDEX IF NOT EXISTS idx_job_applications_location_city ON job_applications(location_city);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_type ON job_applications(job_type);

-- Trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_job_applications_updated_at
    AFTER UPDATE ON job_applications
    FOR EACH ROW
BEGIN
    UPDATE job_applications SET updated_at = datetime('now') WHERE id = NEW.id;
END;