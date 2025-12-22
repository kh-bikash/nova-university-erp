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
    const { course_code, attendance_date, entries } = body

    if (!course_code || !attendance_date || !entries || !Array.isArray(entries)) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    // Get Course ID
    const cRes = await query('SELECT id FROM courses WHERE course_code = $1', [course_code])
    if (cRes.rowCount === 0) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }
    const courseId = cRes.rows[0].id

    // Insert Attendance Records
    // Note: In a real app, we might want to use a transaction or batch insert.
    // For simplicity, we'll iterate.

    for (const entry of entries) {
      // Get Student ID from enrollment number
      const sRes = await query('SELECT id FROM students WHERE enrollment_number = $1', [entry.enrollment])
      if (sRes.rowCount > 0) {
        const studentId = sRes.rows[0].id

        // Check if already marked
        const existing = await query(`
                    SELECT id FROM attendance 
                    WHERE student_id = $1 AND course_id = $2 AND attendance_date = $3
                `, [studentId, courseId, attendance_date])

        if (existing.rowCount > 0) {
          // Update
          await query(`
                        UPDATE attendance SET status = $1 
                        WHERE id = $2
                    `, [entry.status, existing.rows[0].id])
        } else {
          // Insert
          await query(`
                        INSERT INTO attendance (student_id, course_id, attendance_date, status)
                        VALUES ($1, $2, $3, $4)
                    `, [studentId, courseId, attendance_date, entry.status])
        }
      }
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('[KL-ERP] Attendance Mark POST error:', error)
    return NextResponse.json({ error: 'Failed to mark attendance' }, { status: 500 })
  }
}
