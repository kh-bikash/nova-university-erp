const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function testEnrollment() {
    try {
        // 1. Get a student and a course
        const studentRes = await pool.query("SELECT id FROM students LIMIT 1");
        const courseRes = await pool.query("SELECT id FROM courses LIMIT 1");

        if (studentRes.rowCount === 0 || courseRes.rowCount === 0) {
            console.log('Missing student or course data');
            return;
        }

        const studentId = studentRes.rows[0].id;
        const courseId = courseRes.rows[0].id;

        console.log(`Testing enrollment for Student: ${studentId}, Course: ${courseId}`);

        // 2. Call API
        const response = await fetch('http://localhost:3000/api/enrollment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ student_id: studentId, course_id: courseId })
        });

        console.log('Response status:', response.status);
        const text = await response.text();
        console.log('Response body:', text);

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await pool.end();
    }
}

testEnrollment();
