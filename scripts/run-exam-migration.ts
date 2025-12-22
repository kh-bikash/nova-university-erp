import { query } from '../lib/db'
import fs from 'fs'
import path from 'path'

async function runMigration() {
    try {
        const sqlPath = path.join(process.cwd(), 'scripts', '03-create-exam-tables.sql')
        const sql = fs.readFileSync(sqlPath, 'utf8')

        console.log('Running migration...')
        await query(sql)
        console.log('Migration completed successfully.')
    } catch (error) {
        console.error('Migration failed:', error)
    }
}

runMigration()
