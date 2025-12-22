const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function verifyProfiles() {
    try {
        console.log('Verifying profiles...');
        const res = await pool.query(`
      SELECT u.id as user_id, u.email, u.role, s.id as student_id 
      FROM users u 
      LEFT JOIN students s ON u.id = s.user_id 
      WHERE u.role = 'student'
    `);
        console.table(res.rows);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

verifyProfiles();
