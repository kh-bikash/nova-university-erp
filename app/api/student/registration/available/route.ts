
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getCurrentUser } from '@/lib/auth'
import { query } from '@/lib/db'
import { apiResponse, handleApiError } from '@/lib/api-utils'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== 'student') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get student details
        const sRes = await query('SELECT id, department_id, semester FROM students WHERE user_id = $1', [user.id])
        if (sRes.rowCount === 0) return NextResponse.json({ error: 'Student not found' }, { status: 404 })
        const student = sRes.rows[0]

        // Fetch courses available for the student's department OR open electives (assuming all for now based on prompt "choice")
        // And exclude already enrolled courses
        // Note: The prompt says "register a course of their choice", enabling broader selection. 
        // We will return courses that are NOT in course_enrollment for this student.

        const sql = `
            SELECT c.id, c.course_code, c.course_name, c.credits, c.semester, d.name as department_name, f.full_name as faculty_name
            FROM courses c
            JOIN departments d ON c.department_id = d.id
            LEFT JOIN faculty fac ON c.faculty_id = fac.id
            LEFT JOIN users f ON fac.user_id = f.id
            WHERE c.id NOT IN (
                SELECT course_id FROM course_enrollment WHERE student_id = $1
            )
            ORDER BY c.semester, c.course_code
        `

        const res = await query(sql, [student.id])
        console.log(`[Registration API] Student ${student.id}: Found ${res.rowCount} available courses`)

        return apiResponse(res.rows)

    } catch (error) {
        return handleApiError(error)
    }
}
