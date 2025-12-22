const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function checkStudentProfiles() {
    try {
        console.log('Checking student profiles...');

        // Get all users with role 'student'
        const usersRes = await pool.query("SELECT id, email, full_name FROM users WHERE role = 'student'");
        console.log(`Found ${usersRes.rowCount} users with role 'student'.`);

        for (const user of usersRes.rows) {
            const studentRes = await pool.query("SELECT id FROM students WHERE user_id = $1", [user.id]);
            if (studentRes.rowCount === 0) {
                console.log(`[MISSING] User ${user.email} (${user.full_name}) has NO student profile.`);

                // Auto-fix: Create profile
                console.log(`[FIXING] Creating profile for ${user.email}...`);
                await pool.query(`
                INSERT INTO students (user_id, enrollment_number, enrollment_date)
                VALUES ($1, $2, NOW())
            `, [user.id, `ENR${Date.now()}`]); // Simple enrollment number generation
                console.log(`[FIXED] Profile created.`);
            } else {
                console.log(`[OK] User ${user.email} has profile ${studentRes.rows[0].id}.`);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

checkStudentProfiles();
