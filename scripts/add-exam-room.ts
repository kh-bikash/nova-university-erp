import { query } from '../lib/db'

async function runMigration() {
    try {
        console.log('Adding room_no column to exams table...')
        await query(`
            ALTER TABLE exams 
            ADD COLUMN IF NOT EXISTS room_no VARCHAR(50);
        `)
        console.log('Migration completed successfully.')
    } catch (error) {
        console.error('Migration failed:', error)
    }
}

runMigration()
