import { query } from '../lib/db'
import fs from 'fs'
import path from 'path'

async function runMigration() {
    try {
        const sqlPath = path.join(process.cwd(), 'scripts', '05-create-transport-tables.sql')
        const sql = fs.readFileSync(sqlPath, 'utf8')

        console.log('Running transport migration...')
        await query(sql)
        console.log('Transport migration completed successfully.')
    } catch (error) {
        console.error('Migration failed:', error)
    }
}

runMigration()
