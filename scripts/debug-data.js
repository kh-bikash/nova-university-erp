const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function debugData() {
    try {
        await client.connect();
        console.log('Connected to DB');

        const coursesRes = await client.query('SELECT * FROM courses');
        console.log('Courses count:', coursesRes.rowCount);
        if (coursesRes.rowCount > 0) {
            console.log('First Course:', coursesRes.rows[0]);
        }

        const deptsRes = await client.query('SELECT * FROM departments');
        console.log('Departments count:', deptsRes.rowCount);
        if (deptsRes.rowCount > 0) {
            console.log('First Dept:', deptsRes.rows[0]);
        }

        if (coursesRes.rowCount > 0 && deptsRes.rowCount > 0) {
            const c = coursesRes.rows[0];
            const d = deptsRes.rows.find(dept => dept.id === c.department_id);
            console.log(`Course ${c.course_code} has dept_id ${c.department_id}. Found in depts? ${!!d}`);
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

debugData();
