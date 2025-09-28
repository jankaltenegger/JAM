import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Database path
const dbPath = path.join(__dirname, '..', 'data', 'jam.db')

// Initialize database
const db = new Database(dbPath)

// Job data arrays for generating realistic entries
const companies = [
  'Google', 'Microsoft', 'Amazon', 'Apple', 'Meta', 'Netflix', 'Tesla', 'OpenAI',
  'Stripe', 'Shopify', 'Spotify', 'Uber', 'Airbnb', 'Slack', 'Zoom', 'Docker',
  'GitLab', 'GitHub', 'Atlassian', 'Salesforce', 'Adobe', 'Figma', 'Notion',
  'Linear', 'Vercel', 'Supabase', 'PlanetScale', 'Railway', 'Render', 'Fly.io',
  'Cloudflare', 'MongoDB', 'PostgreSQL Inc', 'Redis Labs', 'Elastic', 'Databricks',
  'Snowflake', 'Palantir', 'Datadog', 'New Relic', 'Splunk', 'Twilio', 'SendGrid',
  'Auth0', 'Okta', 'HashiCorp', 'JetBrains', 'Unity', 'Epic Games', 'Riot Games',
  'Discord', 'Twitch', 'Reddit', 'Twitter', 'LinkedIn', 'Pinterest', 'Snapchat',
  'TikTok', 'ByteDance', 'Alibaba', 'Tencent', 'Baidu', 'Xiaomi', 'Samsung',
  'NVIDIA', 'AMD', 'Intel', 'Qualcomm', 'Broadcom', 'Cisco', 'VMware', 'Oracle',
  'IBM', 'Accenture', 'Deloitte', 'McKinsey', 'BCG', 'Bain & Company', 'Goldman Sachs',
  'JPMorgan Chase', 'Morgan Stanley', 'Bank of America', 'Wells Fargo', 'Citigroup',
  'American Express', 'Visa', 'Mastercard', 'PayPal', 'Square', 'Robinhood',
  'Coinbase', 'Kraken', 'Binance', 'FTX', 'Chainlink', 'Polygon', 'Solana Labs',
  'ConsenSys', 'Alchemy', 'Infura', 'Metamask', 'Uniswap', 'Aave', 'Compound',
  'MakerDAO', 'Curve Finance', 'Yearn Finance', 'SushiSwap', '1inch', 'dYdX',
  'Synthetix', 'Bancor', 'Balancer', 'Kyber Network', 'Chainlink Labs'
]

const jobTitles = [
  'Software Engineer', 'Senior Software Engineer', 'Staff Software Engineer',
  'Principal Software Engineer', 'Lead Software Engineer', 'Software Architect',
  'Full Stack Developer', 'Frontend Developer', 'Backend Developer', 'Mobile Developer',
  'iOS Developer', 'Android Developer', 'React Developer', 'Vue.js Developer',
  'Angular Developer', 'Node.js Developer', 'Python Developer', 'Java Developer',
  'C++ Developer', 'Rust Developer', 'Go Developer', 'TypeScript Developer',
  'JavaScript Developer', 'PHP Developer', 'Ruby Developer', 'C# Developer',
  'Swift Developer', 'Kotlin Developer', 'Flutter Developer', 'React Native Developer',
  'DevOps Engineer', 'Site Reliability Engineer', 'Platform Engineer', 'Cloud Engineer',
  'Infrastructure Engineer', 'Security Engineer', 'Data Engineer', 'ML Engineer',
  'Machine Learning Engineer', 'AI Engineer', 'Deep Learning Engineer', 'MLOps Engineer',
  'Data Scientist', 'Senior Data Scientist', 'Principal Data Scientist', 'Research Scientist',
  'Applied Scientist', 'Quantitative Researcher', 'Algorithm Engineer', 'Computer Vision Engineer',
  'NLP Engineer', 'Robotics Engineer', 'Embedded Systems Engineer', 'Firmware Engineer',
  'Hardware Engineer', 'ASIC Engineer', 'FPGA Engineer', 'Verification Engineer',
  'Test Engineer', 'QA Engineer', 'SDET', 'Performance Engineer', 'Automation Engineer',
  'Database Administrator', 'Database Engineer', 'Systems Administrator', 'Network Engineer',
  'Cybersecurity Engineer', 'Information Security Analyst', 'Penetration Tester',
  'Security Consultant', 'Blockchain Developer', 'Smart Contract Developer', 'DeFi Developer',
  'Web3 Developer', 'Solidity Developer', 'Crypto Developer', 'Protocol Engineer',
  'Product Manager', 'Senior Product Manager', 'Principal Product Manager', 'VP of Product',
  'Technical Product Manager', 'Product Owner', 'Product Designer', 'UX Designer',
  'UI Designer', 'UX/UI Designer', 'Design Systems Engineer', 'Frontend Designer',
  'Visual Designer', 'Interaction Designer', 'User Researcher', 'Design Researcher',
  'Engineering Manager', 'Senior Engineering Manager', 'Director of Engineering',
  'VP of Engineering', 'CTO', 'Technical Lead', 'Tech Lead', 'Lead Developer'
]

const locations = [
  'San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX', 'Boston, MA',
  'Los Angeles, CA', 'Chicago, IL', 'Denver, CO', 'Portland, OR', 'Atlanta, GA',
  'Miami, FL', 'Washington, DC', 'Philadelphia, PA', 'Phoenix, AZ', 'San Diego, CA',
  'Las Vegas, NV', 'Detroit, MI', 'Nashville, TN', 'Charlotte, NC', 'Pittsburgh, PA',
  'Remote', 'Remote - US', 'Remote - Global', 'Hybrid - SF', 'Hybrid - NYC',
  'London, UK', 'Berlin, Germany', 'Amsterdam, Netherlands', 'Paris, France',
  'Stockholm, Sweden', 'Copenhagen, Denmark', 'Zurich, Switzerland', 'Dublin, Ireland',
  'Barcelona, Spain', 'Milan, Italy', 'Prague, Czech Republic', 'Warsaw, Poland',
  'Toronto, Canada', 'Vancouver, Canada', 'Montreal, Canada', 'Sydney, Australia',
  'Melbourne, Australia', 'Singapore', 'Tokyo, Japan', 'Seoul, South Korea',
  'Hong Kong', 'Mumbai, India', 'Bangalore, India', 'Tel Aviv, Israel'
]

const skills = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Swift', 'Kotlin',
  'React', 'Vue.js', 'Angular', 'Node.js', 'Express', 'Next.js', 'Nuxt.js', 'Svelte', 'Solid.js',
  'Django', 'Flask', 'FastAPI', 'Spring Boot', 'ASP.NET', 'Ruby on Rails', 'Laravel', 'Symfony',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'Cassandra', 'DynamoDB', 'SQLite',
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'Ansible', 'Jenkins', 'GitLab CI',
  'GitHub Actions', 'CircleCI', 'Travis CI', 'Webpack', 'Vite', 'Rollup', 'Parcel', 'esbuild',
  'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'Jupyter',
  'Spark', 'Hadoop', 'Kafka', 'RabbitMQ', 'GraphQL', 'REST', 'gRPC', 'WebSocket', 'Socket.io',
  'Blockchain', 'Solidity', 'Web3.js', 'Ethers.js', 'Smart Contracts', 'DeFi', 'NFT', 'IPFS'
]

const statuses = ['not_applied', 'applied', 'phone_screen', 'technical_interview', 'onsite_interview', 'final_round', 'offer', 'rejected']

const jobTypes = ['fulltime', 'parttime', 'contract', 'internship']

const experienceLevels = ['Entry', 'Mid', 'Senior', 'Staff', 'Principal', 'Director']

// Function to get random element from array
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)]

// Function to get random elements from array
const getRandomElements = (arr, count) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

// Function to generate random salary
const generateSalary = (level) => {
  const ranges = {
    'Entry': [60000, 90000],
    'Mid': [80000, 130000],
    'Senior': [120000, 180000],
    'Staff': [160000, 250000],
    'Principal': [200000, 350000],
    'Director': [250000, 500000]
  }
  const [min, max] = ranges[level] || ranges['Mid']
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Function to generate job description
const generateDescription = (title, company, skills) => {
  const descriptions = [
    `Join ${company} as a ${title} and help build the next generation of software solutions. You'll work with cutting-edge technologies including ${skills.slice(0, 3).join(', ')} and collaborate with world-class engineers to deliver products used by millions of users worldwide.`,
    
    `We're looking for an experienced ${title} to join our growing team at ${company}. In this role, you'll design and implement scalable systems using ${skills.slice(0, 4).join(', ')}. You'll have the opportunity to work on challenging problems and make a significant impact on our platform.`,
    
    `${company} is seeking a talented ${title} to contribute to our mission of building innovative software. You'll be responsible for developing high-quality applications using technologies like ${skills.slice(0, 3).join(', ')} while working in an agile environment with passionate teammates.`,
    
    `As a ${title} at ${company}, you'll play a key role in architecting and building our core platform. We're looking for someone with strong experience in ${skills.slice(0, 4).join(', ')} who can help us scale to serve our growing user base and deliver exceptional user experiences.`,
    
    `Join our engineering team at ${company} as a ${title} and help shape the future of technology. You'll work on complex technical challenges using ${skills.slice(0, 3).join(', ')} and have the opportunity to learn and grow in a collaborative environment with some of the industry's best engineers.`
  ]
  return getRandomElement(descriptions)
}

// Function to generate application date
const generateApplicationDate = () => {
  const now = new Date()
  const daysAgo = Math.floor(Math.random() * 90) // 0-90 days ago
  const date = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000))
  return date.toISOString()
}

// Parse location into city, state, country
const parseLocation = (locationString) => {
  if (locationString.includes('Remote')) {
    return { city: null, state: null, country: 'US', is_remote: true }
  }
  
  const parts = locationString.split(', ')
  if (parts.length === 2) {
    const [city, stateOrCountry] = parts
    // Check if it's a US state (2 letters) or country
    if (stateOrCountry.length === 2) {
      return { city, state: stateOrCountry, country: 'US', is_remote: false }
    } else {
      return { city, state: null, country: stateOrCountry, is_remote: false }
    }
  }
  
  return { city: parts[0] || null, state: null, country: 'Unknown', is_remote: false }
}

// Generate UUID-like ID
const generateId = () => {
  return 'job_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}

// Generate job applications
const generateJobApplications = (count) => {
  const applications = []
  
  for (let i = 0; i < count; i++) {
    const company = getRandomElement(companies)
    const title = getRandomElement(jobTitles)
    const locationString = getRandomElement(locations)
    const location = parseLocation(locationString)
    const jobType = getRandomElement(jobTypes)
    const experienceLevel = getRandomElement(experienceLevels)
    const salary = generateSalary(experienceLevel)
    const selectedSkills = getRandomElements(skills, Math.floor(Math.random() * 6) + 3)
    const description = generateDescription(title, company, selectedSkills)
    const status = getRandomElement(statuses)
    const applicationDate = generateApplicationDate()
    const datePosted = new Date(new Date(applicationDate).getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    
    applications.push({
      id: generateId(),
      title,
      company,
      location_city: location.city,
      location_state: location.state,
      location_country: location.country,
      is_remote: location.is_remote ? 1 : 0,
      description,
      job_type: jobType,
      salary_min_amount: Math.floor(salary * 0.9),
      salary_max_amount: Math.floor(salary * 1.1),
      salary_currency: 'USD',
      salary_interval: 'yearly',
      date_posted: datePosted,
      experience_range: experienceLevel,
      job_url: `https://${company.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}.com/careers/${title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${Math.floor(Math.random() * 10000)}`,
      status,
      applied_date: status !== 'not_applied' ? applicationDate : null,
      notes: Math.random() > 0.7 ? `Interesting opportunity at ${company}. ${getRandomElement(['Great culture', 'Competitive benefits', 'Remote work available', 'Fast-growing company', 'Cutting-edge technology', 'Strong engineering team'])}.` : null,
      priority: getRandomElement(['low', 'medium', 'high']),
      source: getRandomElement(['LinkedIn', 'Indeed', 'Glassdoor', 'Company Website', 'AngelList', 'Hacker News', 'Stack Overflow', 'Referral', 'Recruiter Contact']),
      skills: selectedSkills,
      last_updated: applicationDate
    })
  }
  
  return applications
}

// Clear existing data
console.log('Clearing existing job applications...')
db.exec('DELETE FROM job_application_skills')
db.exec('DELETE FROM job_application_emails')
db.exec('DELETE FROM job_application_addresses')
db.exec('DELETE FROM job_applications')
db.exec('DELETE FROM skills')

// Generate and insert applications
console.log('Generating job applications...')
const applications = generateJobApplications(500) // Generate 500 job applications

console.log(`Inserting ${applications.length} job applications...`)

// Prepare insert statements
const insertStmt = db.prepare(`
  INSERT INTO job_applications (
    id, title, company, job_url, location_city, location_state, location_country,
    is_remote, description, job_type, salary_min_amount, salary_max_amount, 
    salary_currency, salary_interval, date_posted, status, applied_date,
    notes, priority, source, experience_range, last_updated
  ) VALUES (
    ?, ?, ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?
  )
`)

const insertSkillStmt = db.prepare(`
  INSERT OR IGNORE INTO skills (name) VALUES (?)
`)

const insertJobSkillStmt = db.prepare(`
  INSERT INTO job_application_skills (job_application_id, skill_id) 
  SELECT ?, id FROM skills WHERE name = ?
`)

// Insert all applications in a transaction
const insertMany = db.transaction((applications) => {
  for (const app of applications) {
    // Insert job application
    insertStmt.run(
      app.id, app.title, app.company, app.job_url, app.location_city, app.location_state, app.location_country,
      app.is_remote, app.description, app.job_type, app.salary_min_amount, app.salary_max_amount,
      app.salary_currency, app.salary_interval, app.date_posted, app.status, app.applied_date,
      app.notes, app.priority, app.source, app.experience_range, app.last_updated
    )
    
    // Insert skills
    for (const skill of app.skills) {
      insertSkillStmt.run(skill)
      insertJobSkillStmt.run(app.id, skill)
    }
  }
})

insertMany(applications)

// Get statistics
const stats = db.prepare(`
  SELECT 
    COUNT(*) as total,
    COUNT(CASE WHEN status = 'not_applied' THEN 1 END) as not_applied,
    COUNT(CASE WHEN status = 'applied' THEN 1 END) as applied,
    COUNT(CASE WHEN status = 'phone_screen' THEN 1 END) as phone_screen,
    COUNT(CASE WHEN status = 'technical_interview' THEN 1 END) as technical_interview,
    COUNT(CASE WHEN status = 'onsite_interview' THEN 1 END) as onsite_interview,
    COUNT(CASE WHEN status = 'final_round' THEN 1 END) as final_round,
    COUNT(CASE WHEN status = 'offer' THEN 1 END) as offers,
    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
  FROM job_applications
`).get()

console.log('\n✅ Database seeding completed!')
console.log('\n📊 Statistics:')
console.log(`Total applications: ${stats.total}`)
console.log(`Not Applied: ${stats.not_applied}`)
console.log(`Applied: ${stats.applied}`)
console.log(`Phone Screen: ${stats.phone_screen}`)
console.log(`Technical Interview: ${stats.technical_interview}`)
console.log(`Onsite Interview: ${stats.onsite_interview}`)
console.log(`Final Round: ${stats.final_round}`)
console.log(`Offers: ${stats.offers}`)
console.log(`Rejected: ${stats.rejected}`)

// Sample companies and titles
const companySample = db.prepare('SELECT DISTINCT company FROM job_applications ORDER BY company LIMIT 10').all()
const titleSample = db.prepare('SELECT DISTINCT title FROM job_applications ORDER BY title LIMIT 10').all()

console.log('\n🏢 Sample companies:')
companySample.forEach(row => console.log(`  - ${row.company}`))

console.log('\n💼 Sample job titles:')
titleSample.forEach(row => console.log(`  - ${row.title}`))

// Close database
db.close()

console.log('\n🎉 Ready to test your JAM dashboard with realistic data!')