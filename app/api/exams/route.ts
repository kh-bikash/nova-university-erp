import { NextResponse, type NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const decoded: any = verifyToken(token.value)
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const searchParams = request.nextUrl.searchParams
        const courseId = searchParams.get('course_id')
        const studentId = searchParams.get('student_id')
        const facultyId = searchParams.get('faculty_id')

        // Admin/Faculty can see all or filter
        // Student can only see their exams (enrolled courses)

        let queryText = `
      SELECT 
        e.id,
        e.exam_name,
        e.exam_date,
        e.start_time,
        e.end_time,
        e.max_marks,
        e.status,
        c.course_code,
        c.course_code,
        c.course_name,
        e.room_no
      FROM exams e
      JOIN courses c ON e.course_id = c.id
      WHERE 1=1
    `
        const params: any[] = []
        let paramCount = 1

        if (decoded.role === 'student') {
            // Filter by student's enrolled courses
            queryText += ` AND e.course_id IN (SELECT course_id FROM course_enrollment WHERE student_id = (SELECT id FROM students WHERE user_id = $${paramCount}))`
            params.push(decoded.id)
            paramCount++
        }

        if (facultyId && facultyId === 'me' && decoded.role === 'faculty') {
            const fRes = await query('SELECT id FROM faculty WHERE user_id = $1', [decoded.id])
            if ((fRes.rowCount ?? 0) > 0) {
                queryText += ` AND c.faculty_id = $${paramCount}`
                params.push(fRes.rows[0].id)
                paramCount++
            }
        } else if (facultyId) {
            queryText += ` AND c.faculty_id = $${paramCount}`
            params.push(facultyId)
            paramCount++
        }

        if (courseId) {
            queryText += ` AND e.course_id = $${paramCount}`
            params.push(courseId)
            paramCount++
        }

        queryText += ` ORDER BY e.exam_date DESC`

        const res = await query(queryText, params)
        return NextResponse.json(res.rows)
    } catch (error) {
        console.error('[KL-ERP] Exams GET error:', error)
        return NextResponse.json({ error: 'Failed to fetch exams' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const decoded: any = verifyToken(token.value)
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const body = await request.json()
        const { course_id, exam_name, exam_date, start_time, end_time, max_marks, room_no } = body

        if (!course_id || !exam_name || !exam_date || !start_time || !end_time || !max_marks) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const res = await query(
            `INSERT INTO exams (
        course_id, exam_name, exam_date, start_time, end_time, max_marks, room_no
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [course_id, exam_name, exam_date, start_time, end_time, max_marks, room_no]
        )

        return NextResponse.json(res.rows[0], { status: 201 })
    } catch (error) {
        console.error('[KL-ERP] Exams POST error:', error)
        return NextResponse.json({ error: 'Failed to create exam' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const decoded: any = verifyToken(token.value)
        if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'faculty')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const body = await request.json()
        const { id, status, results, exam_name, exam_date, start_time, end_time, max_marks, course_id, room_no } = body // results is array of { student_id, marks, remarks }

        if (!id) {
            return NextResponse.json({ error: 'Exam ID required' }, { status: 400 })
        }

        // Update exam details if provided
        // Restriction: Only Admin can update details (name, date, room, etc). Faculty can only update results.
        const isDetailsUpdate = exam_name || exam_date || start_time || end_time || max_marks || course_id || room_no;

        if (isDetailsUpdate && decoded.role === 'faculty') {
            return NextResponse.json({ error: 'Faculty cannot edit exam details' }, { status: 403 })
        }

        if (isDetailsUpdate) {
            await query(
                `UPDATE exams 
                 SET exam_name = COALESCE($1, exam_name),
                     exam_date = COALESCE($2, exam_date),
                     start_time = COALESCE($3, start_time),
                     end_time = COALESCE($4, end_time),
                     max_marks = COALESCE($5, max_marks),
                     course_id = COALESCE($6, course_id),
                     room_no = COALESCE($7, room_no)
                 WHERE id = $8`,
                [exam_name, exam_date, start_time, end_time, max_marks, course_id, room_no, id]
            )
        }

        // Update status if provided
        if (status) {
            await query('UPDATE exams SET status = $1 WHERE id = $2', [status, id])
        }

        // Update results if provided
        if (results && Array.isArray(results)) {
            for (const res of results) {
                await query(
                    `INSERT INTO exam_results (exam_id, student_id, marks_obtained, remarks)
                   VALUES ($1, $2, $3, $4)
                   ON CONFLICT (exam_id, student_id) 
                   DO UPDATE SET marks_obtained = $3, remarks = $4, updated_at = NOW()`,
                    [id, res.student_id, res.marks, res.remarks]
                )
            }
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[KL-ERP] Exams PUT error:', error)
        return NextResponse.json({ error: 'Failed to update exam' }, { status: 500 })
    }
}
