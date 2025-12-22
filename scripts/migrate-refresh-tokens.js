require('dotenv').config()
const fs = require('fs')
const path = require('path')
const { Pool } = require('pg')

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
    console.error('DATABASE_URL is not set')
    process.exit(1)
}

const pool = new Pool({ connectionString })

async function migrate() {
    try {
        const sqlPath = path.join(__dirname, '02-create-refresh-tokens.sql')
        const sql = fs.readFileSync(sqlPath, 'utf8')
        console.log('Running migration...')
        await pool.query(sql)
        console.log('Migration completed successfully.')
        process.exit(0)
    } catch (error) {
        console.error('Migration failed:', error)
        process.exit(1)
    } finally {
        await pool.end()
    }
}

migrate()
