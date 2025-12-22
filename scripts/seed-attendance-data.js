const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function seedAttendance() {
    try {
        console.log('Seeding attendance data...');

        // 1. Get Student
        const studentRes = await pool.query("SELECT id FROM students LIMIT 1");
        if (studentRes.rowCount === 0) {
            console.log('No students found.');
            return;
        }
        const studentId = studentRes.rows[0].id;

        // 2. Get Enrolled Courses
        const enrollRes = await pool.query("SELECT course_id FROM course_enrollment WHERE student_id = $1", [studentId]);
        if (enrollRes.rowCount === 0) {
            console.log('Student not enrolled in any courses.');
            return;
        }
        const courses = enrollRes.rows;

        // 3. Insert Attendance
        const statuses = ['present', 'present', 'present', 'absent', 'present', 'leave', 'present'];

        for (const course of courses) {
            console.log(`Seeding for Course ID: ${course.course_id}`);

            // Insert 10 records for past 10 days
            // Insert 10 records for past 10 days
            for (let i = 0; i < 10; i++) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const status = statuses[Math.floor(Math.random() * statuses.length)];

                // Check existence
                const check = await pool.query(
                    "SELECT id FROM attendance WHERE student_id = $1 AND course_id = $2 AND attendance_date = $3",
                    [studentId, course.course_id, date.toISOString().split('T')[0]]
                );

                if (check.rowCount === 0) {
                    await pool.query(
                        "INSERT INTO attendance (student_id, course_id, attendance_date, status) VALUES ($1, $2, $3, $4)",
                        [studentId, course.course_id, date.toISOString().split('T')[0], status]
                    );
                }
            }
        }

        console.log('Seeding complete.');

    } catch (error) {
        console.error('Seeding error:', error);
    } finally {
        await pool.end();
    }
}

seedAttendance();
