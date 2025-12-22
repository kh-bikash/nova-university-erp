#!/usr/bin/env node

/**
 * Attendance Worker - Standalone Node.js script (uses require for better compatibility)
 * Run with: node workers/attendance-worker.js
 * Or: npm run worker:attendance
 */

require('dotenv').config()

const { Worker } = require('bullmq')
const IORedis = require('ioredis')

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379'

async function main() {
  try {
    const connection = new IORedis(REDIS_URL, {
      maxRetriesPerRequest: null,
    })
    console.log('[Attendance Worker] Connecting to Redis:', REDIS_URL.split('@')[1] || 'localhost')

    const worker = new Worker(
      'attendance',
      async (job) => {
        console.log(`[Worker] Processing job ${job.id}...`)
        const { courseId, date, entries, markedByFacultyId } = job.data

        // Dynamic import to avoid circular deps
        const dbModule = await import('../lib/db.js').catch(() => null)
        if (!dbModule) {
          console.warn(`[Worker] DB module not available, skipping job ${job.id}`)
          return
        }

        const { query, default: pool } = dbModule
        if (!pool) {
          // Fallback: sequential writes
          for (const entry of entries) {
            const { enrollment, status, remarks } = entry
            const sRes = await query('SELECT id FROM students WHERE enrollment_number = $1', [enrollment])
            if (sRes.rowCount === 0) continue
            const studentId = sRes.rows[0].id
            await query(
              `INSERT INTO attendance (student_id, course_id, attendance_date, status, remarks, marked_by)
               VALUES ($1,$2,$3,$4,$5,$6)
               ON CONFLICT (student_id, course_id, attendance_date) DO UPDATE SET status = EXCLUDED.status, remarks = EXCLUDED.remarks, marked_by = EXCLUDED.marked_by`,
              [studentId, courseId, date, status, remarks || null, markedByFacultyId]
            )
          }
          console.log(`[Worker] Job ${job.id} completed (fallback mode)`)
          return
        }

        // Transaction mode
        const client = await pool.connect()
        try {
          await client.query('BEGIN')
          for (const entry of entries) {
            const { enrollment, status, remarks } = entry
            const sRes = await client.query('SELECT id FROM students WHERE enrollment_number = $1', [enrollment])
            if (sRes.rowCount === 0) continue
            const studentId = sRes.rows[0].id
            await client.query(
              `INSERT INTO attendance (student_id, course_id, attendance_date, status, remarks, marked_by)
               VALUES ($1,$2,$3,$4,$5,$6)
               ON CONFLICT (student_id, course_id, attendance_date) DO UPDATE SET status = EXCLUDED.status, remarks = EXCLUDED.remarks, marked_by = EXCLUDED.marked_by`,
              [studentId, courseId, date, status, remarks || null, markedByFacultyId]
            )
          }
          await client.query('COMMIT')
          console.log(`[Worker] Job ${job.id} committed to database`)
        } catch (err) {
          await client.query('ROLLBACK')
          console.error(`[Worker] Job ${job.id} rolled back:`, err.message)
          throw err
        } finally {
          client.release()
        }
      },
      { connection }
    )

    worker.on('completed', (job) => {
      console.log(`✓ [Worker] Job ${job.id} completed`)
    })

    worker.on('failed', (job, err) => {
      console.error(`✗ [Worker] Job ${job?.id} failed: ${err.message}`)
    })

    console.log('[Attendance Worker] Started and listening for jobs on queue "attendance"')
    console.log('[Attendance Worker] Press Ctrl+C to stop\n')
  } catch (err) {
    console.error('[Attendance Worker] Fatal error:', err)
    process.exit(1)
  }
}

main()
