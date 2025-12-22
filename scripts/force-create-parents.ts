import { query } from '../lib/db'
import dotenv from 'dotenv'
dotenv.config()

async function runMigration() {
    try {
        console.log('Force creating parent tables...')

        await query(`
            CREATE TABLE IF NOT EXISTS parents (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                phone_number VARCHAR(20),
                address TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS parent_students (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
                student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
                relationship VARCHAR(50), 
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(parent_id, student_id)
            );
            
            -- Add indexes
            CREATE INDEX IF NOT EXISTS idx_parent_students_parent_id ON parent_students(parent_id);
            CREATE INDEX IF NOT EXISTS idx_parent_students_student_id ON parent_students(student_id);
            CREATE INDEX IF NOT EXISTS idx_parents_user_id ON parents(user_id);
        `)

        console.log('Migration completed successfully.')
    } catch (error) {
        console.error('Migration failed:', error)
        process.exit(1)
    }
}

runMigration()
