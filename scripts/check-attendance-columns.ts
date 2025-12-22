import { query } from '../lib/db';

async function checkAttendanceColumns() {
    try {
        const res = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'attendance'
    `);
        console.log('Columns in attendance table:', res.rows);
    } catch (error) {
        console.error(error);
    }
}

checkAttendanceColumns();
