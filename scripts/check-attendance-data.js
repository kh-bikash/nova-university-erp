const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function checkAttendance() {
    try {
        console.log('Checking attendance data...');

        // Get a student
        const studentRes = await pool.query("SELECT id, user_id FROM students LIMIT 1");
        if (studentRes.rowCount === 0) {
            console.log('No students found.');
            return;
        }
        const studentId = studentRes.rows[0].id;
        console.log('Checking for Student ID:', studentId);

        const res = await pool.query('SELECT COUNT(*) FROM attendance WHERE student_id = $1', [studentId]);
        console.log('Attendance Records:', res.rows[0].count);

        if (parseInt(res.rows[0].count) === 0) {
            console.log('No attendance records. Seeding...');
            // Seed logic here or in separate script
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

checkAttendance();
