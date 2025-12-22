import dotenv from 'dotenv'
dotenv.config()

import { query } from '../lib/db'
import fs from 'fs'
import path from 'path'

async function runMigration() {
    try {
        const sqlPath = path.join(__dirname, '09-create-timetable-tables.sql')
        const sql = fs.readFileSync(sqlPath, 'utf8')

        console.log('Running timetable migration...')
        await query(sql)
        console.log('Timetable migration completed successfully')
    } catch (error) {
        console.error('Migration failed:', error)
        process.exit(1)
    }
}

runMigration()
