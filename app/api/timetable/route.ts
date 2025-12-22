import { NextResponse, type NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const searchParams = request.nextUrl.searchParams
        const courseId = searchParams.get('course_id')
        const facultyId = searchParams.get('faculty_id')
        const studentId = searchParams.get('student_id')
        const day = searchParams.get('day')

        let queryText = `
      SELECT 
        t.id,
        t.day_of_week,
        t.start_time,
        t.end_time,
        t.room_number,
        c.course_code,
        c.course_name,
        u.full_name as faculty_name
      FROM timetable t
      JOIN courses c ON t.course_id = c.id
      JOIN faculty f ON t.faculty_id = f.id
      JOIN users u ON f.user_id = u.id
      LEFT JOIN course_enrollment ce ON c.id = ce.course_id
      WHERE 1=1
    `
        const params: any[] = []
        let paramCount = 1

        if (courseId) {
            queryText += ` AND t.course_id = $${paramCount}`
            params.push(courseId)
            paramCount++
        }

        if (facultyId) {
            if (facultyId === 'me') {
                const decoded: any = verifyToken(token.value)
                if (decoded && decoded.role === 'faculty') {
                    const fRes = await query('SELECT id FROM faculty WHERE user_id = $1', [decoded.id])
                    if ((fRes.rowCount ?? 0) > 0) {
                        queryText += ` AND t.faculty_id = $${paramCount}`
                        params.push(fRes.rows[0].id)
                        paramCount++
                    } else {
                        return NextResponse.json([]) // Faculty profile not found
                    }
                }
            } else {
                queryText += ` AND t.faculty_id = $${paramCount}`
                params.push(facultyId)
                paramCount++
            }
        }

        if (studentId) {
            if (studentId === 'me') {
                const decoded: any = verifyToken(token.value)
                if (decoded && decoded.role === 'student') {
                    // Get student ID from user ID
                    const sRes = await query('SELECT id FROM students WHERE user_id = $1', [decoded.id])
                    if ((sRes.rowCount ?? 0) > 0) {
                        queryText += ` AND ce.student_id = $${paramCount}`
                        params.push(sRes.rows[0].id)
                        paramCount++
                    } else {
                        return NextResponse.json([]) // Student profile not found
                    }
                }
            } else {
                queryText += ` AND ce.student_id = $${paramCount}`
                params.push(studentId)
                paramCount++
            }
        }

        if (day) {
            queryText += ` AND t.day_of_week = $${paramCount}`
            params.push(day)
            paramCount++
        }

        queryText += ` GROUP BY t.id, c.course_code, c.course_name, u.full_name
      ORDER BY 
      CASE 
        WHEN day_of_week = 'Monday' THEN 1
        WHEN day_of_week = 'Tuesday' THEN 2
        WHEN day_of_week = 'Wednesday' THEN 3
        WHEN day_of_week = 'Thursday' THEN 4
        WHEN day_of_week = 'Friday' THEN 5
        WHEN day_of_week = 'Saturday' THEN 6
        ELSE 7
      END,
      start_time`

        const res = await query(queryText, params)
        return NextResponse.json(res.rows)
    } catch (error) {
        console.error('[KL-ERP] Timetable GET error:', error)
        return NextResponse.json({ error: 'Failed to fetch timetable' }, { status: 500 })
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
        const { course_id, faculty_id, day_of_week, start_time, end_time, room_number, semester } = body

        if (!course_id || !faculty_id || !day_of_week || !start_time || !end_time || !room_number || !semester) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // 1. Check Faculty Conflict
        const facultyConflict = await query(
            `SELECT id FROM timetable 
       WHERE faculty_id = $1 
       AND day_of_week = $2 
       AND (
         (start_time <= $3 AND end_time > $3) OR
         (start_time < $4 AND end_time >= $4) OR
         (start_time >= $3 AND end_time <= $4)
       )`,
            [faculty_id, day_of_week, start_time, end_time]
        )

        if ((facultyConflict.rowCount ?? 0) > 0) {
            return NextResponse.json({ error: 'Faculty is already booked for this time slot' }, { status: 409 })
        }

        // 2. Check Room Conflict
        const roomConflict = await query(
            `SELECT id FROM timetable 
       WHERE room_number = $1 
       AND day_of_week = $2 
       AND (
         (start_time <= $3 AND end_time > $3) OR
         (start_time < $4 AND end_time >= $4) OR
         (start_time >= $3 AND end_time <= $4)
       )`,
            [room_number, day_of_week, start_time, end_time]
        )

        if ((roomConflict.rowCount ?? 0) > 0) {
            return NextResponse.json({ error: 'Room is already booked for this time slot' }, { status: 409 })
        }

        // 3. Create Entry
        const res = await query(
            `INSERT INTO timetable (
        course_id, faculty_id, day_of_week, start_time, end_time, room_number, semester, academic_year
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [course_id, faculty_id, day_of_week, start_time, end_time, room_number, semester, body.academic_year || new Date().getFullYear().toString()]
        )

        return NextResponse.json(res.rows[0], { status: 201 })
    } catch (error) {
        console.error('[KL-ERP] Timetable POST error:', error)
        return NextResponse.json({ error: 'Failed to create timetable entry' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const decoded: any = verifyToken(token.value)
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const searchParams = request.nextUrl.searchParams
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 })
        }

        const res = await query('DELETE FROM timetable WHERE id = $1 RETURNING id', [id])

        if ((res.rowCount ?? 0) === 0) {
            return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[KL-ERP] Timetable DELETE error:', error)
        return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 })
    }
}
