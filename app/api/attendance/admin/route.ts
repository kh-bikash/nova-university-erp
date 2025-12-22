export { dynamic, fetchCache, revalidate } from "@/app/api/_config";
import { NextResponse, type NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const decoded: any = verifyToken(token.value)
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const searchParams = request.nextUrl.searchParams
        const courseId = searchParams.get('course_id')
        const date = searchParams.get('date')
        const studentId = searchParams.get('student_id')

        let queryText = `
      SELECT 
        a.id,
        a.attendance_date as date,
        a.status,
        a.remarks,
        s.enrollment_number,
        u.full_name as student_name,
        c.course_code,
        c.course_name
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN courses c ON a.course_id = c.id
      WHERE 1=1
    `
        const params: any[] = []
        let paramCount = 1

        if (courseId) {
            queryText += ` AND a.course_id = $${paramCount}`
            params.push(courseId)
            paramCount++
        }

        if (date) {
            queryText += ` AND a.attendance_date = $${paramCount}`
            params.push(date)
            paramCount++
        }

        if (studentId) {
            queryText += ` AND a.student_id = $${paramCount}`
            params.push(studentId)
            paramCount++
        }

        queryText += ` ORDER BY a.attendance_date DESC, u.full_name LIMIT 100`

        const res = await query(queryText, params)
        return NextResponse.json(res.rows)
    } catch (error) {
        console.error('[KL-ERP] Admin Attendance GET error:', error)
        return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const decoded: any = verifyToken(token.value)
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const body = await request.json()
        const { id, status, remarks } = body

        if (!id || !status) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Update attendance record
        const res = await query(
            `UPDATE attendance 
       SET status = $1, remarks = $2, updated_at = NOW() 
       WHERE id = $3 
       RETURNING *`,
            [status, remarks || 'Admin Override', id]
        )

        if (res.rowCount === 0) {
            return NextResponse.json({ error: 'Record not found' }, { status: 404 })
        }

        // Log this action (Audit Log) - simplified for now
        // In a real system, we'd insert into an audit_logs table here.
        console.log(`[AUDIT] Admin ${decoded.id} updated attendance ${id} to ${status}`)

        return NextResponse.json(res.rows[0])
    } catch (error) {
        console.error('[KL-ERP] Admin Attendance PUT error:', error)
        return NextResponse.json({ error: 'Failed to update attendance' }, { status: 500 })
    }
}
