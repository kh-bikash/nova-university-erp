import { query } from '../lib/db';

async function checkType() {
    try {
        const res = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'timetables' AND column_name = 'semester'
    `);
        console.log('Semester column type:', res.rows[0]);
    } catch (error) {
        console.error(error);
    }
}

checkType();
