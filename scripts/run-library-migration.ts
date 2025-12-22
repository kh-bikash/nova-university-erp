import { query } from '../lib/db'
import fs from 'fs'
import path from 'path'

async function runMigration() {
    try {
        const sqlPath = path.join(process.cwd(), 'scripts', '04-create-library-tables.sql')
        const sql = fs.readFileSync(sqlPath, 'utf8')

        console.log('Running library migration...')
        await query(sql)
        console.log('Library migration completed successfully.')
    } catch (error) {
        console.error('Migration failed:', error)
    }
}

runMigration()
