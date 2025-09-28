import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './ui/pagination'
import {
  MapPin,
  DollarSign,
  Calendar,
  ExternalLink,
  Building2,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  XCircle
} from 'lucide-react'

interface JobApplication {
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
  
  // Application tracking fields (our additions)
  appliedDate?: string
  responseDate?: string
  lastUpdated: string
  status: 'not_applied' | 'applied' | 'phone_screen' | 'technical_interview' | 'onsite_interview' | 'final_round' | 'offer' | 'rejected'
  notes?: string
  priority?: 'low' | 'medium' | 'high'
  source: string
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}



interface PaginatedJobApplicationsResponse {
  jobs: JobApplication[]
  pagination: PaginationInfo
}

interface JobApplicationItemProps {
  job: JobApplication
  onApply: (jobId: string) => void
}

function JobApplicationItem({ job, onApply }: JobApplicationItemProps) {
  const statusConfig = {
    not_applied: { 
      color: 'var(--text-2)', 
      bgColor: 'var(--background-mute)', 
      text: 'Not Applied',
      icon: Clock
    },
    applied: { 
      color: '#3b82f6', 
      bgColor: 'rgba(59, 130, 246, 0.1)', 
      text: 'Applied',
      icon: CheckCircle2
    },
    phone_screen: { 
      color: 'var(--accent)', 
      bgColor: 'rgba(255, 107, 53, 0.1)', 
      text: 'Phone Screen',
      icon: Calendar
    },
    technical_interview: { 
      color: 'var(--accent)', 
      bgColor: 'rgba(255, 107, 53, 0.1)', 
      text: 'Technical Interview',
      icon: Calendar
    },
    onsite_interview: { 
      color: 'var(--accent)', 
      bgColor: 'rgba(255, 107, 53, 0.1)', 
      text: 'Onsite Interview',
      icon: Calendar
    },
    final_round: { 
      color: 'var(--accent)', 
      bgColor: 'rgba(255, 107, 53, 0.1)', 
      text: 'Final Round',
      icon: Calendar
    },
    offer: { 
      color: '#10b981', 
      bgColor: 'rgba(16, 185, 129, 0.1)', 
      text: 'Offer Received',
      icon: CheckCircle2
    },
    rejected: { 
      color: '#ef4444', 
      bgColor: 'rgba(239, 68, 68, 0.1)', 
      text: 'Rejected',
      icon: XCircle
    }
  }

  const status = statusConfig[job.status] || statusConfig.not_applied
  const StatusIcon = status.icon

  return (
    <Card style={{ backgroundColor: 'var(--background-soft)', borderColor: 'var(--background-mute)' }} className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle style={{ color: 'var(--text)' }} className="text-lg mb-2">{job.title}</CardTitle>
            <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-2)' }}>
              <div className="flex items-center gap-1">
                <Building2 className="w-4 h-4" />
                <span>{job.company}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{[job.location.city, job.location.state, job.location.country].filter(Boolean).join(', ') || 'Remote'}</span>
              </div>
              {job.job_function?.min_amount && (
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  <span>${job.job_function.min_amount.toLocaleString()}{job.job_function.max_amount ? ` - $${job.job_function.max_amount.toLocaleString()}` : ''}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div 
              className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"
              style={{ 
                color: status.color, 
                backgroundColor: status.bgColor 
              }}
            >
              <StatusIcon className="w-3 h-3" />
              {status.text}
            </div>
            {job.status === 'not_applied' && (
              <Button 
                onClick={() => onApply(job.id)}
                style={{ backgroundColor: 'var(--accent)', color: 'black' }}
                className="px-6 py-2 font-semibold hover:opacity-90 transition-opacity"
              >
                APPLY
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-3)' }}>
            <span>Posted: {new Date(job.date_posted).toLocaleDateString()}</span>
            {job.appliedDate && <span>Applied: {new Date(job.appliedDate).toLocaleDateString()}</span>}
          </div>
          <Button 
            variant="outline" 
            size="sm"
            style={{ borderColor: 'var(--background-mute)', color: 'var(--text-2)' }}
            className="hover:opacity-80"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            View Job
          </Button>
        </div>
        <p className="text-sm mt-3" style={{ color: 'var(--text-2)' }}>
          {job.description}
        </p>
      </CardContent>
    </Card>
  )
}

// Database API function
const fetchJobApplications = async (page: number, limit: number, status?: string, search?: string): Promise<PaginatedJobApplicationsResponse> => {
  try {
    return await window.api.db.getJobApplications(page, limit, status, search)
  } catch (error) {
    console.error('Failed to fetch job applications from database:', error)
    // Fallback to mock data for development
    return await fetchMockJobApplications(page, limit)
  }
}

// Mock data generation for development/fallback
const fetchMockJobApplications = async (page: number, limit: number): Promise<PaginatedJobApplicationsResponse> => {
  // Generate sample jobs that conform to the schema
  const allJobs: JobApplication[] = []
  
  const companies = ['Google', 'Microsoft', 'Meta', 'Apple', 'Netflix', 'Spotify', 'Amazon', 'Tesla', 'Uber', 'Airbnb', 'Stripe', 'OpenAI', 'Anthropic', 'GitHub', 'Figma', 'Notion', 'Slack', 'Zoom', 'Salesforce', 'Adobe']
  const jobTitles = ['Software Engineer', 'Senior Software Engineer', 'Frontend Engineer', 'Backend Engineer', 'Full Stack Developer', 'DevOps Engineer', 'Data Scientist', 'Product Manager', 'UX Designer', 'ML Engineer', 'Site Reliability Engineer', 'Security Engineer', 'Mobile Developer', 'QA Engineer', 'Technical Lead']
  const locations = [
    { city: 'San Francisco', state: 'CA', country: 'USA' },
    { city: 'New York', state: 'NY', country: 'USA' },
    { city: 'Austin', state: 'TX', country: 'USA' },
    { city: 'Seattle', state: 'WA', country: 'USA' },
    { city: 'Boston', state: 'MA', country: 'USA' },
    { city: 'Chicago', state: 'IL', country: 'USA' },
    { city: 'Los Angeles', state: 'CA', country: 'USA' },
    { city: 'Denver', state: 'CO', country: 'USA' },
    { city: 'Portland', state: 'OR', country: 'USA' },
    { city: 'Miami', state: 'FL', country: 'USA' }
  ]
  const statuses: JobApplication['status'][] = ['not_applied', 'applied', 'phone_screen', 'technical_interview', 'onsite_interview', 'final_round', 'offer', 'rejected']

  const descriptions = [
    "Build scalable web applications using modern frameworks and cloud technologies.",
    "Lead cross-functional teams to deliver innovative products that impact millions of users.",
    "Design intuitive user experiences that delight customers and drive engagement.",
    "Develop machine learning models to solve complex business problems.",
    "Architect and maintain reliable distributed systems at scale.",
    "Create beautiful, responsive interfaces using cutting-edge frontend technologies.",
    "Optimize database performance and ensure data security across all systems.",
    "Drive technical strategy and mentor junior engineers in best practices.",
    "Collaborate with product managers to translate business requirements into technical solutions.",
    "Implement automated testing and deployment pipelines for continuous delivery.",
    "Research and prototype emerging technologies to maintain competitive advantage.",
    "Analyze user behavior data to inform product decisions and improvements.",
    "Build mobile applications that work seamlessly across iOS and Android platforms.",
    "Develop APIs and microservices that power our platform ecosystem.",
    "Lead security initiatives and ensure compliance with industry standards."
  ]

  for (let i = 1; i <= 75; i++) {
    // Use different prime number seeds for maximum variety across pages
    // This ensures each page has a good mix of different jobs
    const titleIndex = (i * 3 + Math.floor((i-1)/10) * 17) % jobTitles.length
    const companyIndex = (i * 7 + Math.floor((i-1)/10) * 23) % companies.length  
    const locationIndex = (i * 11 + Math.floor((i-1)/10) * 31) % locations.length
    const descIndex = (i * 13 + Math.floor((i-1)/10) * 37) % descriptions.length
    
    // Vary date posted - spread across last 60 days with more randomness
    const daysAgo = (i * 17) % 60
    const postDate = new Date()
    postDate.setDate(postDate.getDate() - daysAgo)
    
    // Vary last updated - between 0-14 days ago from post date
    const updateDaysAgo = (i * 23) % 15
    const lastUpdateDate = new Date(postDate)
    lastUpdateDate.setDate(lastUpdateDate.getDate() + updateDaysAgo)
    
    const baseAmount = 60000 + (Math.floor(i / 5) * 15000) + ((i * 7) % 8) * 5000
    
    // More variety in job types and remote status
    const jobTypeIndex = (i * 19) % 4
    const jobTypes = ['fulltime', 'parttime', 'contract', 'internship'] as const
    const isRemote = (i * 3 + i * 7) % 4 === 0 // More varied remote distribution
    
    allJobs.push({
      id: i.toString(),
      title: jobTitles[titleIndex],
      company: companies[companyIndex],
      company_url: `https://${companies[companyIndex].toLowerCase().replace(/\s+/g, '')}.com`,
      job_url: `https://${companies[companyIndex].toLowerCase().replace(/\s+/g, '')}.com/careers/job/${i}`,
      location: locations[locationIndex],
      is_remote: isRemote,
      description: descriptions[descIndex],
      job_type: jobTypes[jobTypeIndex],
      job_function: {
        interval: 'yearly',
        min_amount: baseAmount,
        max_amount: baseAmount + 25000 + ((i * 5) % 10) * 3000,
        currency: 'USD',
        salary_source: 'direct_data'
      },
      date_posted: postDate.toISOString(),
      lastUpdated: lastUpdateDate.toISOString(),
      status: statuses[(i * 5) % statuses.length],
      skills: [
        ['JavaScript', 'React', 'Node.js'],
        ['Python', 'Django', 'PostgreSQL'],
        ['Java', 'Spring Boot', 'MySQL'],
        ['TypeScript', 'Angular', 'MongoDB'],
        ['Go', 'Docker', 'Kubernetes'],
        ['Rust', 'WebAssembly', 'Redis'],
        ['C++', 'OpenGL', 'CUDA'],
        ['Swift', 'iOS', 'Core Data'],
        ['Kotlin', 'Android', 'Room'],
        ['PHP', 'Laravel', 'Redis'],
        ['Ruby', 'Rails', 'Sidekiq'],
        ['C#', '.NET', 'Azure'],
        ['Scala', 'Spark', 'Kafka'],
        ['Vue.js', 'Nuxt', 'Vuetify'],
        ['Flutter', 'Dart', 'Firebase']
      ][(i * 29) % 15], // Use different prime for more variety
      job_level: ['Entry Level', 'Mid Level', 'Senior Level', 'Staff Level', 'Principal'][(i * 31) % 5],
      company_industry: ['Technology', 'E-commerce', 'Social Media', 'Cloud Computing', 'AI/ML', 'Fintech'][(i * 37) % 6],
      priority: (['low', 'medium', 'high'] as const)[(i * 41) % 3],
      source: ['linkedin', 'indeed', 'glassdoor', 'company_website', 'referral'][(i * 43) % 5],
      
      // Add some variation to show dates applied (for applied jobs)
      appliedDate: statuses[(i * 5) % statuses.length] === 'applied' 
        ? new Date(lastUpdateDate.getTime() + (i * 47) % (7 * 24 * 60 * 60 * 1000)).toISOString()
        : undefined
    })
  }

  // Simulate pagination
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedJobs = allJobs.slice(startIndex, endIndex)

  return {
    jobs: paginatedJobs,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(allJobs.length / limit),
      totalItems: allJobs.length,
      itemsPerPage: limit
    }
  }
}

export default function JobApplications() {
  const [currentPage, setCurrentPage] = useState(1)
  const [jobs, setJobs] = useState<JobApplication[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  })
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('interviews_all')

  const ITEMS_PER_PAGE = 10

  // Load jobs with server-side pagination and filtering
  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true)
      try {
        const response = await fetchJobApplications(
          currentPage, 
          ITEMS_PER_PAGE, 
          selectedStatus === 'all' ? undefined : selectedStatus,
          searchQuery || undefined
        )
        setJobs(response.jobs)
        setPagination(response.pagination)
      } catch (error) {
        console.error('Failed to load jobs:', error)
        setJobs([])
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: ITEMS_PER_PAGE
        })
      } finally {
        setLoading(false)
      }
    }
    
    loadJobs()
  }, [currentPage, selectedStatus, searchQuery]) // Reload when page, status, or search changes

  const handleApply = async (jobId: string) => {
    try {
      // Update job status in database
      await window.api.db.updateJobApplication(jobId, {
        status: 'applied',
        appliedDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      })

      // Update local state to reflect the change
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === jobId 
            ? { 
                ...job, 
                status: 'applied' as const, 
                appliedDate: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
              }
            : job
        )
      )
    } catch (error) {
      console.error('Failed to update job status:', error)
      // Could show a toast notification here
    }
  }

  // Reset to first page when filters change
  useEffect(() => {
    if (currentPage > 1) {
      setCurrentPage(1)
    }
  }, [selectedStatus, searchQuery])

  // Function to seed database with sample data
  const seedSampleData = async () => {
    try {
      setLoading(true)
      
      // Generate a few sample jobs
      const sampleJobs = await generateSampleJobs(10) // Just 10 for initial seed
      
      for (const job of sampleJobs) {
        await window.api.db.createJobApplication(job)
      }
      
      // Reload data
      const response = await fetchJobApplications(
        currentPage, 
        ITEMS_PER_PAGE, 
        selectedStatus === 'all' ? undefined : selectedStatus,
        searchQuery || undefined
      )
      setJobs(response.jobs)
      setPagination(response.pagination)
    } catch (error) {
      console.error('Failed to seed sample data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Generate sample job data
  const generateSampleJobs = async (count: number): Promise<Omit<JobApplication, 'id'>[]> => {
    const jobs: Omit<JobApplication, 'id'>[] = []
    
    const companies = ['Google', 'Microsoft', 'Meta', 'Apple', 'Netflix']
    const jobTitles = ['Software Engineer', 'Senior Software Engineer', 'Frontend Engineer', 'Backend Engineer', 'Full Stack Developer']
    const locations = [
      { city: 'San Francisco', state: 'CA', country: 'USA' },
      { city: 'New York', state: 'NY', country: 'USA' },
      { city: 'Austin', state: 'TX', country: 'USA' }
    ]
    const statuses: JobApplication['status'][] = ['not_applied', 'applied', 'phone_screen', 'technical_interview', 'offer']
    
    for (let i = 0; i < count; i++) {
      const titleIndex = i % jobTitles.length
      const companyIndex = i % companies.length
      const locationIndex = i % locations.length
      const statusIndex = i % statuses.length
      
      const baseAmount = 80000 + (i * 10000)
      
      jobs.push({
        title: jobTitles[titleIndex],
        company: companies[companyIndex],
        company_url: `https://${companies[companyIndex].toLowerCase().replace(/\s+/g, '')}.com`,
        job_url: `https://${companies[companyIndex].toLowerCase().replace(/\s+/g, '')}.com/careers/${i}`,
        location: locations[locationIndex],
        is_remote: i % 3 === 0,
        description: `Exciting opportunity for a ${jobTitles[titleIndex]} at ${companies[companyIndex]}.`,
        job_type: 'fulltime',
        job_function: {
          interval: 'yearly',
          min_amount: baseAmount,
          max_amount: baseAmount + 30000,
          currency: 'USD',
          salary_source: 'direct_data'
        },
        date_posted: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(), // i days ago
        lastUpdated: new Date().toISOString(),
        status: statuses[statusIndex],
        priority: 'medium',
        source: 'linkedin',
        skills: ['JavaScript', 'React', 'Node.js']
      })
    }
    
    return jobs
  }

  const stats = useMemo(() => {
    // Calculate stats from all jobs, not just current page
    return {
      total: jobs.length,
      notApplied: jobs.filter(job => job.status === 'not_applied').length,
      applied: jobs.filter(job => job.status === 'applied').length,
      totalInterviews: jobs.filter(job => ['phone_screen', 'technical_interview', 'onsite_interview', 'final_round'].includes(job.status)).length,
      interviews: jobs.filter(job => ['phone_screen', 'technical_interview', 'onsite_interview', 'final_round'].includes(job.status)).length,
      offers: jobs.filter(job => job.status === 'offer').length
    }
  }, [jobs])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>Job Applications</h1>
          <p style={{ color: 'var(--text-2)' }} className="mt-1">Manage and track your job applications ({pagination.totalItems} total)</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" style={{ borderColor: 'var(--background-mute)', color: 'var(--text)' }} className="hover:opacity-80">
            <Filter className="w-4 h-4 mr-2" />
            Filter Jobs
          </Button>
          <Button style={{ backgroundColor: 'var(--accent)', color: 'black' }} className="hover:opacity-90">
            Add New Job
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-3)' }} />
          <input
            type="text"
            placeholder="Search jobs by title or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border"
            style={{ 
              backgroundColor: 'var(--background-soft)', 
              borderColor: 'var(--background-mute)',
              color: 'var(--text)'
            }}
          />
        </div>
        <select 
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 rounded-lg border"
          style={{ 
            backgroundColor: 'var(--background-soft)', 
            borderColor: 'var(--background-mute)',
            color: 'var(--text)'
          }}
        >
          <option value="all">All Statuses</option>
          <option value="not_applied">Not Applied</option>
          <option value="applied">Applied</option>
          <option value="interviews_all">All Interviews</option>
          <option value="phone_screen">Phone Screen</option>
          <option value="technical_interview">Technical Interview</option>
          <option value="onsite_interview">Onsite Interview</option>
          <option value="final_round">Final Round</option>
          <option value="offer">Offer</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card 
          className="cursor-pointer transition-all hover:scale-105"
          style={{ 
            backgroundColor: selectedStatus === 'all' ? 'rgba(255, 107, 53, 0.1)' : 'var(--background-soft)', 
            borderColor: selectedStatus === 'all' ? 'var(--accent)' : 'var(--background-mute)',
            borderWidth: selectedStatus === 'all' ? '2px' : '1px'
          }}
          onClick={() => {
            setSelectedStatus('all')
            setCurrentPage(1) // Reset to first page when filtering
          }}
        >
          <CardContent className="p-4">
            <div className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{stats.total}</div>
            <div className="text-sm" style={{ color: 'var(--text-2)' }}>Total Jobs</div>
          </CardContent>
        </Card>
        <Card 
          className="cursor-pointer transition-all hover:scale-105"
          style={{ 
            backgroundColor: selectedStatus === 'not_applied' ? 'rgba(255, 107, 53, 0.1)' : 'var(--background-soft)', 
            borderColor: selectedStatus === 'not_applied' ? 'var(--accent)' : 'var(--background-mute)',
            borderWidth: selectedStatus === 'not_applied' ? '2px' : '1px'
          }}
          onClick={() => {
            setSelectedStatus('not_applied')
            setCurrentPage(1)
          }}
        >
          <CardContent className="p-4">
            <div className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{stats.notApplied}</div>
            <div className="text-sm" style={{ color: 'var(--text-2)' }}>Not Applied</div>
          </CardContent>
        </Card>
        <Card 
          className="cursor-pointer transition-all hover:scale-105"
          style={{ 
            backgroundColor: selectedStatus === 'applied' ? 'rgba(255, 107, 53, 0.1)' : 'var(--background-soft)', 
            borderColor: selectedStatus === 'applied' ? 'var(--accent)' : 'var(--background-mute)',
            borderWidth: selectedStatus === 'applied' ? '2px' : '1px'
          }}
          onClick={() => {
            setSelectedStatus('applied')
            setCurrentPage(1)
          }}
        >
          <CardContent className="p-4">
            <div className="text-2xl font-bold" style={{ color: '#3b82f6' }}>{stats.applied}</div>
            <div className="text-sm" style={{ color: 'var(--text-2)' }}>Applied</div>
          </CardContent>
        </Card>
        <Card 
          className="cursor-pointer transition-all hover:scale-105"
          style={{ 
            backgroundColor: ['interviews_all', 'phone_screen', 'technical_interview', 'onsite_interview', 'final_round'].includes(selectedStatus) ? 'rgba(255, 107, 53, 0.1)' : 'var(--background-soft)', 
            borderColor: ['interviews_all', 'phone_screen', 'technical_interview', 'onsite_interview', 'final_round'].includes(selectedStatus) ? 'var(--accent)' : 'var(--background-mute)',
            borderWidth: ['interviews_all', 'phone_screen', 'technical_interview', 'onsite_interview', 'final_round'].includes(selectedStatus) ? '2px' : '1px'
          }}
          onClick={() => {
            // Cycle through: Total Interviews → Phone Screen → Technical → Onsite → Final Round → back to Total
            const interviewStatuses = ['interviews_all', 'phone_screen', 'technical_interview', 'onsite_interview', 'final_round']
            const currentInterviewIndex = interviewStatuses.indexOf(selectedStatus)
            const nextStatus = currentInterviewIndex >= 0 && currentInterviewIndex < interviewStatuses.length - 1 
              ? interviewStatuses[currentInterviewIndex + 1] 
              : interviewStatuses[0]
            setSelectedStatus(nextStatus)
            setCurrentPage(1)
          }}
        >
          <CardContent className="p-4">
            <div className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{stats.totalInterviews}</div>
            <div className="text-sm" style={{ color: 'var(--text-2)' }}>
              {selectedStatus === 'interviews_all' && 'Total Interviews'}
              {['phone_screen', 'technical_interview', 'onsite_interview', 'final_round'].includes(selectedStatus) && 'Interview Stages'}
              {!['interviews_all', 'phone_screen', 'technical_interview', 'onsite_interview', 'final_round'].includes(selectedStatus) && 'Total Interviews'}
            </div>
            {selectedStatus === 'phone_screen' && (
              <div className="text-xs mt-1 font-medium" style={{ color: 'var(--accent)' }}>
                📞 Phone Screen
              </div>
            )}
            {selectedStatus === 'technical_interview' && (
              <div className="text-xs mt-1 font-medium" style={{ color: 'var(--accent)' }}>
                💻 Technical
              </div>
            )}
            {selectedStatus === 'onsite_interview' && (
              <div className="text-xs mt-1 font-medium" style={{ color: 'var(--accent)' }}>
                🏢 Onsite
              </div>
            )}
            {selectedStatus === 'final_round' && (
              <div className="text-xs mt-1 font-medium" style={{ color: 'var(--accent)' }}>
                🎯 Final Round
              </div>
            )}
          </CardContent>
        </Card>
        <Card 
          className="cursor-pointer transition-all hover:scale-105"
          style={{ 
            backgroundColor: selectedStatus === 'offer' ? 'rgba(255, 107, 53, 0.1)' : 'var(--background-soft)', 
            borderColor: selectedStatus === 'offer' ? 'var(--accent)' : 'var(--background-mute)',
            borderWidth: selectedStatus === 'offer' ? '2px' : '1px'
          }}
          onClick={() => {
            setSelectedStatus('offer')
            setCurrentPage(1)
          }}
        >
          <CardContent className="p-4">
            <div className="text-2xl font-bold" style={{ color: '#10b981' }}>{stats.offers}</div>
            <div className="text-sm" style={{ color: 'var(--text-2)' }}>Offers</div>
          </CardContent>
        </Card>
      </div>

      {/* Job List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>
            Available Positions (Page {currentPage} of {pagination.totalPages})
          </h2>
          {loading && (
            <div className="text-sm" style={{ color: 'var(--text-2)' }}>Loading...</div>
          )}
        </div>
        
        <div className="space-y-0">
          {jobs.length === 0 && !loading && (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>No Job Applications Found</h3>
              <p className="mb-6" style={{ color: 'var(--text-2)' }}>Get started by adding some sample job applications.</p>
              <Button 
                onClick={seedSampleData}
                style={{ backgroundColor: 'var(--accent)', color: 'black' }}
                className="px-6 py-2 font-semibold hover:opacity-90 transition-opacity"
              >
                Add Sample Jobs
              </Button>
            </div>
          )}
          {jobs.map((job) => (
            <JobApplicationItem
              key={job.id}
              job={job}
              onApply={handleApply}
            />
          ))}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm" style={{ color: 'var(--text-2)' }}>
              Showing {((currentPage - 1) * pagination.itemsPerPage) + 1} - {Math.min(currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} jobs
            </div>
            
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage > 1) setCurrentPage(currentPage - 1)
                    }}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                    style={{ color: 'var(--text)' }}
                  />
                </PaginationItem>

                {/* Generate page numbers */}
                {(() => {
                  const totalPages = pagination.totalPages
                  const current = currentPage
                  const delta = 2 // How many pages to show on each side of current
                  
                  let pages: (number | 'ellipsis')[] = []
                  
                  if (totalPages <= 7) {
                    // Show all pages if total is small
                    pages = Array.from({ length: totalPages }, (_, i) => i + 1)
                  } else {
                    // Always show first page
                    pages.push(1)
                    
                    // Add ellipsis after first page if needed
                    if (current - delta > 2) {
                      pages.push('ellipsis')
                    }
                    
                    // Add pages around current page
                    const start = Math.max(2, current - delta)
                    const end = Math.min(totalPages - 1, current + delta)
                    
                    for (let i = start; i <= end; i++) {
                      pages.push(i)
                    }
                    
                    // Add ellipsis before last page if needed
                    if (current + delta < totalPages - 1) {
                      pages.push('ellipsis')
                    }
                    
                    // Always show last page
                    if (totalPages > 1) {
                      pages.push(totalPages)
                    }
                  }
                  
                  return pages.map((page, index) => {
                    if (page === 'ellipsis') {
                      return (
                        <PaginationItem key={`ellipsis-${index}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )
                    }
                    
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            setCurrentPage(page)
                          }}
                          isActive={page === currentPage}
                          style={{
                            backgroundColor: page === currentPage ? 'var(--accent)' : 'transparent',
                            color: page === currentPage ? 'black' : 'var(--text)'
                          }}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  })
                })()}

                <PaginationItem>
                  <PaginationNext 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage < pagination.totalPages) setCurrentPage(currentPage + 1)
                    }}
                    className={currentPage === pagination.totalPages ? 'pointer-events-none opacity-50' : ''}
                    style={{ color: 'var(--text)' }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  )
}