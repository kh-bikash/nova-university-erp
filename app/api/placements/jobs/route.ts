
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { query } from '@/lib/db'
import { apiResponse, handleApiError } from '@/lib/api-utils'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        console.log(`[Placements API] Auth Check. User: ${user?.id}, Role: ${user?.role}`)

        if (!user || user.role !== 'student') {
            console.log(`[Placements API] Access Denied. User: ${user ? 'found' : 'missing'}, Role: ${user?.role}. Expecting 'student'.`)
            return NextResponse.json({
                error: `Forbidden: User role is '${user?.role || 'none'}', expected 'student'`,
                debug: { role: user?.role, id: user?.id }
            }, { status: 403 })
        }

        // Get student ID
        const sRes = await query('SELECT id FROM students WHERE user_id = $1', [user.id])
        if (sRes.rowCount === 0) return NextResponse.json({ error: 'Student not found' }, { status: 404 })
        const student = sRes.rows[0]

        // Fetch jobs with application status
        const sql = `
            SELECT j.id, j.title, j.description, j.requirements, j.location, j.salary_range, j.job_type, j.posted_date, j.deadline_date,
                   c.name as company_name, c.industry, c.website,
                   ja.status as application_status, ja.application_date
            FROM job_postings j
            JOIN companies c ON j.company_id = c.id
            LEFT JOIN job_applications ja ON j.id = ja.job_id AND ja.student_id = $1
            WHERE j.is_active = true AND j.deadline_date >= CURRENT_DATE
            ORDER BY j.posted_date DESC
        `

        const res = await query(sql, [student.id])
        console.log(`[Placements API] Student ${student.id} fetching jobs. Found: ${res.rowCount}`)
        if (res.rowCount === 0) {
            console.log(`[Placements API] Query returned 0 rows. Date check: CURRENT_DATE vs deadline.`)
        }

        return apiResponse(res.rows)

    } catch (error) {
        return handleApiError(error)
    }
}
