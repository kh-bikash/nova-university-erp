
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

        // Fetch timetable for enrolled courses
        // We join timetable with courses and faculty
        // AND we filter by course_enrollment for this student
        const sql = `
            SELECT t.id, t.day_of_week, t.start_time, t.end_time, t.room_number,
                   c.course_code, c.course_name,
                   f.full_name as faculty_name
            FROM timetable t
            JOIN courses c ON t.course_id = c.id
            JOIN course_enrollment ce ON c.id = ce.course_id
            LEFT JOIN faculty fac ON c.faculty_id = fac.id
            LEFT JOIN users f ON fac.user_id = f.id
            WHERE ce.student_id = $1
            ORDER BY 
                CASE 
                    WHEN t.day_of_week = 'Monday' THEN 1
                    WHEN t.day_of_week = 'Tuesday' THEN 2
                    WHEN t.day_of_week = 'Wednesday' THEN 3
                    WHEN t.day_of_week = 'Thursday' THEN 4
                    WHEN t.day_of_week = 'Friday' THEN 5
                    WHEN t.day_of_week = 'Saturday' THEN 6
                    ELSE 7
                END,
                t.start_time
        `

        const res = await query(sql, [student.id])

        return apiResponse(res.rows)

    } catch (error) {
        return handleApiError(error)
    }
}
