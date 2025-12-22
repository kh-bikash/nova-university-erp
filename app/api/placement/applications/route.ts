import { NextResponse, type NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const decoded: any = verifyToken(token.value)
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        // If student, return their applications
        if (decoded.role === 'student') {
            const sRes = await query('SELECT id FROM students WHERE user_id = $1', [decoded.id])
            if (sRes.rowCount === 0) return NextResponse.json([])

            const studentId = sRes.rows[0].id
            const appRes = await query(`
                SELECT ja.*, jp.title, jp.salary_range, c.name as company_name
                FROM job_applications ja
                JOIN job_postings jp ON ja.job_id = jp.id
                JOIN companies c ON jp.company_id = c.id
                WHERE ja.student_id = $1
                ORDER BY ja.application_date DESC
            `, [studentId])

            return NextResponse.json(appRes.rows)
        }

        // If admin, return all applications (or filtered by job_id)
        const searchParams = request.nextUrl.searchParams
        const jobId = searchParams.get('job_id')

        let queryText = `
            SELECT ja.*, u.full_name as student_name, s.enrollment_number, s.cgpa, jp.title as job_title
            FROM job_applications ja
            JOIN students s ON ja.student_id = s.id
            JOIN users u ON s.user_id = u.id
            JOIN job_postings jp ON ja.job_id = jp.id
            WHERE 1=1
        `
        const params: any[] = []

        if (jobId) {
            queryText += ` AND ja.job_id = $1`
            params.push(jobId)
        }

        queryText += ` ORDER BY ja.application_date DESC`

        const res = await query(queryText, params)
        return NextResponse.json(res.rows)

    } catch (error) {
        console.error('[KL-ERP] Placement Applications GET error:', error)
        return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const decoded: any = verifyToken(token.value)
        if (decoded.role !== 'student') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const body = await request.json()
        const { job_id, resume_link, cover_letter } = body

        if (!job_id) {
            return NextResponse.json({ error: 'Job ID required' }, { status: 400 })
        }

        const sRes = await query('SELECT id FROM students WHERE user_id = $1', [decoded.id])
        if (sRes.rowCount === 0) return NextResponse.json({ error: 'Student not found' }, { status: 404 })
        const studentId = sRes.rows[0].id

        // Check duplicate
        const existing = await query(
            `SELECT * FROM job_applications WHERE student_id = $1 AND job_id = $2`,
            [studentId, job_id]
        )
        if ((existing.rowCount ?? 0) > 0) {
            return NextResponse.json({ error: 'Already applied' }, { status: 400 })
        }

        // Apply
        const res = await query(
            `INSERT INTO job_applications (student_id, job_id, resume_link, cover_letter, status)
             VALUES ($1, $2, $3, $4, 'applied') RETURNING *`,
            [studentId, job_id, resume_link, cover_letter]
        )

        return NextResponse.json(res.rows[0], { status: 201 })

    } catch (error) {
        console.error('[KL-ERP] Placement Application POST error:', error)
        return NextResponse.json({ error: 'Failed to apply' }, { status: 500 })
    }
}
