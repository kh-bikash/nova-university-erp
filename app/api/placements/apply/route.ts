
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { query } from '@/lib/db'
import { apiResponse, handleApiError } from '@/lib/api-utils'

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== 'student') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { jobId } = body

        if (!jobId) {
            return NextResponse.json({ error: 'Job ID is required' }, { status: 400 })
        }

        // Get student ID
        const sRes = await query('SELECT id FROM students WHERE user_id = $1', [user.id])
        if (sRes.rowCount === 0) return NextResponse.json({ error: 'Student not found' }, { status: 404 })
        const studentId = sRes.rows[0].id

        // Check availability
        const jobRes = await query('SELECT id FROM job_postings WHERE id = $1 AND is_active = true AND deadline_date >= CURRENT_DATE', [jobId])
        if (jobRes.rowCount === 0) {
            return NextResponse.json({ error: 'Job not found or expired' }, { status: 400 })
        }

        // Check if already applied
        const check = await query('SELECT id FROM job_applications WHERE student_id = $1 AND job_id = $2', [studentId, jobId])
        if ((check.rowCount ?? 0) > 0) {
            return NextResponse.json({ error: 'Already applied for this job' }, { status: 400 })
        }

        // Apply
        await query(
            'INSERT INTO job_applications (student_id, job_id) VALUES ($1, $2)',
            [studentId, jobId]
        )

        return apiResponse({ message: 'Successfully applied' })

    } catch (error) {
        return handleApiError(error)
    }
}
