
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
        const { courseId } = body // Handling single course registration as per common flow

        if (!courseId) {
            return NextResponse.json({ error: 'Course ID is required' }, { status: 400 })
        }

        // Get student ID
        const sRes = await query('SELECT id FROM students WHERE user_id = $1', [user.id])
        if (sRes.rowCount === 0) return NextResponse.json({ error: 'Student not found' }, { status: 404 })
        const studentId = sRes.rows[0].id

        // Check if already enrolled (double check)
        const check = await query('SELECT id FROM course_enrollment WHERE student_id = $1 AND course_id = $2', [studentId, courseId])
        if ((check.rowCount ?? 0) > 0) {
            return NextResponse.json({ error: 'Already enrolled in this course' }, { status: 400 })
        }

        // Get Academic Year (Defaults to 2024-2025 if not found in settings)
        // Ideally fetch from system_settings, but for robustness:
        // const settings = await query("SELECT value FROM system_settings WHERE key = 'academic_year'")
        // const academicYear = settings.rows[0]?.value || '2024-2025'
        const academicYear = '2024-2025'

        // Enroll
        await query(
            'INSERT INTO course_enrollment (student_id, course_id, academic_year) VALUES ($1, $2, $3)',
            [studentId, courseId, academicYear]
        )

        return apiResponse({ message: 'Successfully enrolled' })

    } catch (error) {
        return handleApiError(error)
    }
}
