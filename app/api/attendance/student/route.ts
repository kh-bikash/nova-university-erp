export { dynamic, fetchCache, revalidate } from "@/app/api/_config";
import { NextResponse, type NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const decoded: any = verifyToken(token.value)
        if (!decoded || decoded.role !== 'student') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Get student ID
        const sRes = await query('SELECT id FROM students WHERE user_id = $1', [decoded.id])
        if (sRes.rowCount === 0) return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })
        const studentId = sRes.rows[0].id

        // Get overall stats and course-wise breakdown
        const statsRes = await query(`
            SELECT 
                c.course_code,
                c.course_name,
                COUNT(*) as total_lectures,
                SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_count,
                SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent_count,
                SUM(CASE WHEN a.status = 'leave' THEN 1 ELSE 0 END) as leave_count
            FROM attendance a
            JOIN courses c ON a.course_id = c.id
            WHERE a.student_id = $1
            GROUP BY c.course_code, c.course_name
        `, [studentId])

        // Get recent history
        const historyRes = await query(`
            SELECT 
                a.attendance_date as date,
                a.status,
                c.course_code,
                c.course_name
            FROM attendance a
            JOIN courses c ON a.course_id = c.id
            WHERE a.student_id = $1
            ORDER BY a.attendance_date DESC
            LIMIT 10
        `, [studentId])

        return NextResponse.json({
            courses: statsRes.rows,
            history: historyRes.rows
        })

    } catch (error) {
        console.error('[KL-ERP] Student Attendance GET error:', error)
        return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 })
    }
}
