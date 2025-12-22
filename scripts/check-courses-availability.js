const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function checkCourses() {
    try {
        const res = await pool.query(`
      SELECT 
        c.id, c.course_code, c.course_name, c.max_students,
        (SELECT COUNT(*) FROM course_enrollment ce WHERE ce.course_id = c.id)::int as enrolled_count
      FROM courses c
    `);
        console.log('Courses found:', res.rows);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

checkCourses();
