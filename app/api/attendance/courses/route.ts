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

    // Get Faculty ID
    const fRes = await query('SELECT id FROM faculty WHERE user_id = $1', [decoded.id])
    if (fRes.rowCount === 0) {
      return NextResponse.json({ error: 'Faculty profile not found' }, { status: 404 })
    }
    const facultyId = fRes.rows[0].id

    // Get Courses
    const coursesRes = await query(`
            SELECT id, course_code, course_name, credits, semester
            FROM courses 
            WHERE faculty_id = $1
        `, [facultyId])

    return NextResponse.json(coursesRes.rows)

  } catch (error) {
    console.error('[KL-ERP] Attendance Courses GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
  }
}
