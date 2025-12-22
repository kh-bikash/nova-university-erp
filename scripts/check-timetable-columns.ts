import { query } from '../lib/db';

async function checkColumns() {
    try {
        const res = await query(`
      SELECT column_name, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'timetables'
    `);
        console.log('Columns in timetables table:', res.rows);
    } catch (error) {
        console.error(error);
    }
}

checkColumns();
