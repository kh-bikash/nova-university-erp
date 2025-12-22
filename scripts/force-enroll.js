const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function forceEnroll() {
    const userId = '9a58370e-2670-4233-8298-745051c87aaf';

    try {
        // 1. Get Student ID
        const studentRes = await pool.query('SELECT id FROM students WHERE user_id = $1', [userId]);
        if (studentRes.rowCount === 0) {
            console.log('Student profile not found for user.');
            return;
        }
        const studentId = studentRes.rows[0].id;
        console.log('Student ID:', studentId);

        // 2. Get a Course
        const courseRes = await pool.query('SELECT id, course_code FROM courses LIMIT 1');
        if (courseRes.rowCount === 0) {
            console.log('No courses found.');
            return;
        }
        const course = courseRes.rows[0];
        console.log('Course:', course.course_code, course.id);

        // 3. Call API
        console.log('Calling API...');
        const res = await fetch('http://localhost:3000/api/enrollment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ student_id: studentId, course_id: course.id })
        });

        console.log('API Status:', res.status);
        const text = await res.text();
        console.log('API Response:', text);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

forceEnroll();
