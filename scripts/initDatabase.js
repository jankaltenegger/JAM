import Database from 'better-sqlite3'
import { readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Database and schema paths
const dbPath = path.join(__dirname, '..', 'data', 'jam.db')
const schemaPath = path.join(__dirname, '..', 'shared', 'database', 'schema.sql')

console.log('Initializing database with schema...')
console.log(`Database path: ${dbPath}`)
console.log(`Schema path: ${schemaPath}`)

// Read schema file
const schema = readFileSync(schemaPath, 'utf8')

// Initialize database
const db = new Database(dbPath)

// Execute schema
db.exec(schema)

console.log('✅ Database initialized with schema')

// Check if tables exist
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()
console.log('\n📋 Tables created:')
tables.forEach(table => console.log(`  - ${table.name}`))

// Close database
db.close()

console.log('\n🎉 Ready to seed database!')