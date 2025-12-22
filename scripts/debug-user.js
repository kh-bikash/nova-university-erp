const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function debugUser() {
    const userId = '9a58370e-2670-4233-8298-745051c87aaf';
    try {
        console.log(`Checking user: ${userId}`);

        // 1. Check User table
        const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        if (userRes.rowCount === 0) {
            console.log('User NOT found in users table!');
            return;
        }
        console.log('User found:', userRes.rows[0]);

        // 2. Check Student table
        const studentRes = await pool.query('SELECT * FROM students WHERE user_id = $1', [userId]);
        if (studentRes.rowCount === 0) {
            console.log('Student profile NOT found.');

            // Fix it right now
            console.log('Creating student profile...');
            const newStudent = await pool.query(`
            INSERT INTO students (user_id, enrollment_number, enrollment_date)
            VALUES ($1, $2, NOW()) RETURNING *
        `, [userId, 'ENR' + Date.now()]);
            console.log('Created student profile:', newStudent.rows[0]);
        } else {
            console.log('Student profile FOUND:', studentRes.rows[0]);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

debugUser();
