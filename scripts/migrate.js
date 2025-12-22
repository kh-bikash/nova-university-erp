const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env' });

async function migrate() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('Connected to database');

        if (!process.env.DATABASE_URL) {
            console.error('DATABASE_URL is not defined in environment variables.');
            process.exit(1);
        }

        // Get all SQL files
        const files = fs.readdirSync(__dirname)
            .filter(f => f.endsWith('.sql'))
            .sort();

        console.log(`Found ${files.length} migration files.`);

        for (const file of files) {
            console.log(`Running ${file}...`);
            const sqlPath = path.join(__dirname, file);
            const sql = fs.readFileSync(sqlPath, 'utf8');

            try {
                await client.query(sql);
                console.log(`✓ ${file} completed.`);
            } catch (err) {
                if (err.code === '42P07') { // duplicate_table
                    console.log(`! ${file}: Table already exists (skipped).`);
                } else if (err.code === '42710') { // duplicate_object (constraint/index)
                    console.log(`! ${file}: Object already exists (skipped).`);
                } else if (err.code === '23505') { // unique_violation
                    console.log(`! ${file}: Unique violation (skipped).`);
                } else {
                    console.error(`✗ ${file} failed:`, err.message);
                    // Optional: throw err; to stop on error
                }
            }
        }

        console.log('All migrations finished.');
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

migrate();
