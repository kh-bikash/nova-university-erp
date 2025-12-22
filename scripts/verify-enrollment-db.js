const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function verifyEnrollmentDB() {
    const userId = '9a58370e-2670-4233-8298-745051c87aaf';

    try {
        console.log('Verifying enrollment capability...');

        // 1. Get Student ID
        const studentRes = await pool.query('SELECT id FROM students WHERE user_id = $1', [userId]);
        if (studentRes.rowCount === 0) {
            console.log('Student profile not found.');
            return;
        }
        const studentId = studentRes.rows[0].id;
        console.log('Student ID:', studentId);

        // 2. Get a Course
        const courseRes = await pool.query('SELECT id, course_code, max_students FROM courses LIMIT 1');
        const course = courseRes.rows[0];
        console.log('Target Course:', course);

        // 3. Check if already enrolled
        const checkRes = await pool.query('SELECT * FROM course_enrollment WHERE student_id = $1 AND course_id = $2', [studentId, course.id]);
        if (checkRes.rowCount > 0) {
            console.log('User is ALREADY enrolled in this course.');
            console.log('Deleting existing enrollment to test insertion...');
            await pool.query('DELETE FROM course_enrollment WHERE id = $1', [checkRes.rows[0].id]);
            console.log('Deleted.');
        }

        // 4. Attempt Insert
        console.log('Attempting manual INSERT...');
        const insertRes = await pool.query(`
        INSERT INTO course_enrollment (student_id, course_id, academic_year, enrollment_date)
        VALUES ($1, $2, '2024-2025', NOW())
        RETURNING *
    `, [studentId, course.id]);

        console.log('INSERT Success:', insertRes.rows[0]);

    } catch (error) {
        console.error('DB Error:', error);
    } finally {
        await pool.end();
    }
}

verifyEnrollmentDB();
