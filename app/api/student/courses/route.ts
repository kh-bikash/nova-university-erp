
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { query } from '@/lib/db'
import { apiResponse, handleApiError } from '@/lib/api-utils'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== 'student') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get student ID
        const sRes = await query('SELECT id FROM students WHERE user_id = $1', [user.id])
        if (sRes.rowCount === 0) return NextResponse.json({ error: 'Student not found' }, { status: 404 })
        const student = sRes.rows[0]

        // Fetch enrolled courses
        const sql = `
            SELECT c.id, c.course_code, c.course_name, c.credits, c.semester, 
                   ce.academic_year, ce.grade, ce.marks, ce.enrollment_date,
                   f.full_name as faculty_name
            FROM course_enrollment ce
            JOIN courses c ON ce.course_id = c.id
            LEFT JOIN faculty fac ON c.faculty_id = fac.id
            LEFT JOIN users f ON fac.user_id = f.id
            WHERE ce.student_id = $1
            ORDER BY ce.enrollment_date DESC
        `

        const res = await query(sql, [student.id])

        return apiResponse(res.rows)

    } catch (error) {
        return handleApiError(error)
    }
}
