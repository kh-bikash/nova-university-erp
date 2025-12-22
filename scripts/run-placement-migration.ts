import { query } from '../lib/db'
import fs from 'fs'
import path from 'path'

async function runMigration() {
    try {
        const sqlPath = path.join(process.cwd(), 'scripts', '06-create-placement-tables.sql')
        const sql = fs.readFileSync(sqlPath, 'utf8')

        console.log('Running placement migration...')
        await query(sql)
        console.log('Placement migration completed successfully.')
    } catch (error) {
        console.error('Migration failed:', error)
    }
}

runMigration()
