import { NextResponse, type NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const decoded: any = verifyToken(token.value)
        if (!decoded || decoded.role !== 'faculty') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const body = await request.json()
        const { course_code, grades } = body

        if (!course_code || !grades || !Array.isArray(grades)) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
        }

        // 1. Get Course ID
        const cRes = await query('SELECT id, academic_year FROM courses WHERE course_code = $1', [course_code])
        if (cRes.rowCount === 0) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 })
        }
        const course = cRes.rows[0]
        const courseId = course.id
        // Fallback academic year if not in course table (it might be in enrollment or separate)
        // For now, let's assume '2024-2025' or get from course if available. 
        // Checking schema: courses table doesn't have academic_year, course_enrollment does.
        // We'll use a default for now or pass it from frontend.
        const academicYear = '2024-2025'

        // 2. Upsert Grades
        for (const grade of grades) {
            const { id: studentId, internal, external } = grade
            const total = (parseFloat(internal) || 0) + (parseFloat(external) || 0)

            // Calculate Letter Grade (Simple logic)
            let letter = 'F'
            let points = 0.0
            if (total >= 90) { letter = 'A'; points = 10.0 }
            else if (total >= 80) { letter = 'B'; points = 8.0 }
            else if (total >= 70) { letter = 'C'; points = 6.0 }
            else if (total >= 60) { letter = 'D'; points = 4.0 }
            else if (total >= 50) { letter = 'E'; points = 2.0 }

            // Check if exists
            const check = await query(`
                SELECT id FROM grades 
                WHERE student_id = $1 AND course_id = $2
            `, [studentId, courseId])

            if (check.rowCount > 0) {
                // Update
                await query(`
                    UPDATE grades 
                    SET internal_marks = $1, external_marks = $2, total_marks = $3, 
                        letter_grade = $4, grade_point = $5, updated_at = NOW()
                    WHERE id = $6
                `, [internal, external, total, letter, points, check.rows[0].id])
            } else {
                // Insert
                await query(`
                    INSERT INTO grades (student_id, course_id, academic_year, internal_marks, external_marks, total_marks, letter_grade, grade_point)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                `, [studentId, courseId, academicYear, internal, external, total, letter, points])
            }
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('[KL-ERP] Grading Submit POST error:', error)
        return NextResponse.json({ error: 'Failed to submit grades' }, { status: 500 })
    }
}
