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
        const sRes = await query('SELECT id, enrollment_number, batch_year FROM students WHERE user_id = $1', [decoded.id])
        if (sRes.rowCount === 0) return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })
        const student = sRes.rows[0]

        // Get results
        const resultsRes = await query(`
            SELECT 
                er.marks_obtained,
                er.remarks,
                e.exam_name,
                e.max_marks,
                c.course_code,
                c.course_name,
                c.credits,
                c.semester
            FROM exam_results er
            JOIN exams e ON er.exam_id = e.id
            JOIN courses c ON e.course_id = c.id
            WHERE er.student_id = $1
            ORDER BY c.semester DESC, c.course_code ASC
        `, [student.id])

        // Group by semester
        const results = resultsRes.rows

        return NextResponse.json({
            student: {
                name: decoded.name, // Assuming name is in token or we fetch it
                enrollment: student.enrollment_number,
                semester: results.length > 0 ? results[0].semester : student.batch_year // Fallback
            },
            results: results
        })

    } catch (error) {
        console.error('[KL-ERP] Results GET error:', error)
        return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 })
    }
}
