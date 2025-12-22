const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

async function runTest() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    try {
        // 1. Get a student user
        const userRes = await pool.query("SELECT u.id, u.email, u.role FROM users u JOIN students s ON u.id = s.user_id LIMIT 1");
        if (userRes.rowCount === 0) {
            console.log('No student users found in DB');
            return;
        }
        const user = userRes.rows[0];
        console.log('Testing with user:', user.email);

        // 2. Generate Token
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        const headers = { 'Cookie': `auth-token=${token}` };

        // 3. Test Profile API
        console.log('\n--- Testing /api/student/profile ---');
        const profileRes = await fetch('http://localhost:3000/api/student/profile', { headers });
        console.log('Status:', profileRes.status);
        if (profileRes.ok) {
            const profile = await profileRes.json();
            console.log('Profile found, ID:', profile.id);
        } else {
            console.log('Error:', await profileRes.text());
        }

        // 4. Test Courses API
        console.log('\n--- Testing /api/courses ---');
        const coursesRes = await fetch('http://localhost:3000/api/courses', { headers });
        console.log('Status:', coursesRes.status);
        if (coursesRes.ok) {
            const courses = await coursesRes.json();
            console.log('Courses response:', JSON.stringify(courses).substring(0, 100) + '...');
        } else {
            console.log('Error:', await coursesRes.text());
        }

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await pool.end();
    }
}

runTest();
