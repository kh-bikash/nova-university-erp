import 'dotenv/config';
import { Worker } from 'bullmq';
import IORedis from 'ioredis';
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
async function initWorker() {
    const connection = new IORedis(REDIS_URL);
    const worker = new Worker('attendance', async (job) => {
        const { courseId, date, entries, markedByFacultyId } = job.data;
        // Lazy load db to avoid circular dependency
        const { query, default: pool } = await import('@/lib/db');
        if (!pool) {
            // Fallback: process sequentially using query helper
            for (const entry of entries) {
                const { enrollment, status, remarks } = entry;
                const sRes = await query('SELECT id FROM students WHERE enrollment_number = $1', [enrollment]);
                if (sRes.rowCount === 0)
                    continue;
                const studentId = sRes.rows[0].id;
                await query(`INSERT INTO attendance (student_id, course_id, attendance_date, status, remarks, marked_by)
             VALUES ($1,$2,$3,$4,$5,$6)
             ON CONFLICT (student_id, course_id, attendance_date) DO UPDATE SET status = EXCLUDED.status, remarks = EXCLUDED.remarks, marked_by = EXCLUDED.marked_by`, [studentId, courseId, date, status, remarks || null, markedByFacultyId]);
            }
            return;
        }
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            for (const entry of entries) {
                const { enrollment, status, remarks } = entry;
                const sRes = await client.query('SELECT id FROM students WHERE enrollment_number = $1', [enrollment]);
                if (sRes.rowCount === 0)
                    continue;
                const studentId = sRes.rows[0].id;
                await client.query(`INSERT INTO attendance (student_id, course_id, attendance_date, status, remarks, marked_by)
             VALUES ($1,$2,$3,$4,$5,$6)
             ON CONFLICT (student_id, course_id, attendance_date) DO UPDATE SET status = EXCLUDED.status, remarks = EXCLUDED.remarks, marked_by = EXCLUDED.marked_by`, [studentId, courseId, date, status, remarks || null, markedByFacultyId]);
            }
            await client.query('COMMIT');
        }
        catch (err) {
            await client.query('ROLLBACK');
            throw err;
        }
        finally {
            client.release();
        }
    }, { connection });
    worker.on('completed', (job) => {
        console.log(`[Attendance Worker] Job ${job.id} completed`);
    });
    worker.on('failed', (job, err) => {
        console.error(`[Attendance Worker] Job ${job?.id} failed:`, err.message);
    });
    console.log('[Attendance Worker] Started and listening for jobs...');
}
initWorker().catch((err) => {
    console.error('[Attendance Worker] Fatal error:', err);
    process.exit(1);
});
