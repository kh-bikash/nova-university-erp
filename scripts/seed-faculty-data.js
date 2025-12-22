const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function seedFacultyData() {
    try {
        console.log('Seeding faculty data...');

        // 1. Get or Create Faculty User
        let userRes = await pool.query("SELECT id FROM users WHERE role = 'faculty' LIMIT 1");
        let userId;
        if (userRes.rowCount === 0) {
            console.log('Creating faculty user...');
            const newUser = await pool.query(`
            INSERT INTO users (email, password, full_name, role)
            VALUES ('faculty@test.com', 'password123', 'Dr. Test Faculty', 'faculty')
            RETURNING id
        `);
            userId = newUser.rows[0].id;
        } else {
            userId = userRes.rows[0].id;
        }

        // 2. Get or Create Faculty Profile
        let facultyRes = await pool.query("SELECT id FROM faculty WHERE user_id = $1", [userId]);
        let facultyId;
        if (facultyRes.rowCount === 0) {
            console.log('Creating faculty profile...');
            const newFaculty = await pool.query(`
            INSERT INTO faculty (user_id, employee_id, department_id, designation)
            VALUES ($1, 'FAC001', (SELECT id FROM departments LIMIT 1), 'Professor')
            RETURNING id
        `, [userId]);
            facultyId = newFaculty.rows[0].id;
        } else {
            facultyId = facultyRes.rows[0].id;
        }

        // 3. Assign Courses
        console.log('Assigning courses...');
        await pool.query(`
        UPDATE courses SET faculty_id = $1 WHERE faculty_id IS NULL
    `, [facultyId]);

        console.log('Seeding complete.');

    } catch (error) {
        console.error('Seeding error:', error);
    } finally {
        await pool.end();
    }
}

seedFacultyData();
