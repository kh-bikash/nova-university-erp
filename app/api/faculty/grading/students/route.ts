export { dynamic, fetchCache, revalidate } from "@/app/api/_config";
import { NextResponse, type NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const decoded: any = verifyToken(token.value)
        if (!decoded || decoded.role !== 'faculty') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const courseCode = searchParams.get('course_code')

        if (!courseCode) {
            return NextResponse.json({ error: 'Course code is required' }, { status: 400 })
        }

        // 1. Get Course ID
        const cRes = await query('SELECT id FROM courses WHERE course_code = $1', [courseCode])
        if (cRes.rowCount === 0) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 })
        }
        const courseId = cRes.rows[0].id

        // 2. Get Enrolled Students with Grades
        // We join course_enrollment with students and users to get details
        // We also LEFT JOIN grades to get existing marks
        const studentsRes = await query(`
            SELECT 
                s.id, 
                s.enrollment_number as enrollment, 
                u.full_name as name,
                g.internal_marks as internal,
                g.external_marks as external
            FROM course_enrollment ce
            JOIN students s ON ce.student_id = s.id
            JOIN users u ON s.user_id = u.id
            LEFT JOIN grades g ON ce.student_id = g.student_id AND ce.course_id = g.course_id
            WHERE ce.course_id = $1
            ORDER BY s.enrollment_number ASC
        `, [courseId])

        return NextResponse.json(studentsRes.rows)

    } catch (error) {
        console.error('[KL-ERP] Grading Students GET error:', error)
        return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 })
    }
}
