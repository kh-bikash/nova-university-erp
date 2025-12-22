import { query } from '../lib/db';

async function checkFaculty() {
    try {
        const res = await query(`
      SELECT f.id, u.full_name 
      FROM faculty f
      JOIN users u ON f.user_id = u.id
    `);
        console.log('Faculty count:', res.rowCount);
        console.log('Faculty list:', res.rows);
    } catch (error) {
        console.error(error);
    }
}

checkFaculty();
