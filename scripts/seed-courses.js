const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Allow overriding connection string (e.g. for production)
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
});

async function seedCourses() {
    try {
        console.log('🌱 Seeding Departments and Courses...');

        // 1. Seed Departments
        const departments = [
            { code: 'CSE', name: 'Computer Science & Engineering' },
            { code: 'ECE', name: 'Electronics & Communication' },
            { code: 'ME', name: 'Mechanical Engineering' },
            { code: 'MBA', name: 'Business Administration' }
        ];

        for (const dept of departments) {
            await pool.query(`
        INSERT INTO departments (code, name)
        VALUES ($1, $2)
        ON CONFLICT (code) DO NOTHING
      `, [dept.code, dept.name]);
        }
        console.log('✅ Departments seeded');

        // 2. Fetch Department IDs
        const deptRes = await pool.query('SELECT id, code FROM departments');
        const deptMap = {};
        deptRes.rows.forEach(r => deptMap[r.code] = r.id);

        // 3. Seed Courses
        const courses = [
            { code: 'CS101', name: 'Introduction to Programming', credits: 4, semester: 1, dept: 'CSE' },
            { code: 'CS102', name: 'Data Structures', credits: 4, semester: 2, dept: 'CSE' },
            { code: 'CS201', name: 'Database Management Systems', credits: 3, semester: 3, dept: 'CSE' },
            { code: 'CS202', name: 'Operating Systems', credits: 3, semester: 4, dept: 'CSE' },
            { code: 'EC101', name: 'Digital Electronics', credits: 4, semester: 1, dept: 'ECE' },
            { code: 'MB101', name: 'Management Principles', credits: 3, semester: 1, dept: 'MBA' }
        ];

        for (const course of courses) {
            if (deptMap[course.dept]) {
                await pool.query(`
          INSERT INTO courses (course_code, course_name, credits, semester, department_id, max_students)
          VALUES ($1, $2, $3, $4, $5, 60)
          ON CONFLICT (course_code) DO NOTHING
        `, [course.code, course.name, course.credits, course.semester, deptMap[course.dept]]);
            }
        }
        console.log('✅ Courses seeded');

    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        await pool.end();
    }
}

seedCourses();
