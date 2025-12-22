import { NextResponse, type NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const decoded: any = verifyToken(token.value)
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        // If student, return their requests
        if (decoded.role === 'student') {
            const sRes = await query('SELECT id FROM students WHERE user_id = $1', [decoded.id])
            if (sRes.rowCount === 0) return NextResponse.json([])

            const studentId = sRes.rows[0].id
            const reqRes = await query(`
                SELECT * FROM service_requests 
                WHERE student_id = $1
                ORDER BY request_date DESC
            `, [studentId])

            return NextResponse.json(reqRes.rows)
        }

        // If admin, return all requests
        const reqRes = await query(`
            SELECT sr.*, u.full_name as student_name, s.enrollment_number
            FROM service_requests sr
            JOIN students s ON sr.student_id = s.id
            JOIN users u ON s.user_id = u.id
            ORDER BY sr.request_date DESC
        `)
        return NextResponse.json(reqRes.rows)

    } catch (error) {
        console.error('[KL-ERP] Service Requests GET error:', error)
        return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 })
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
        const { service_type, description } = body

        if (!service_type) {
            return NextResponse.json({ error: 'Service type required' }, { status: 400 })
        }

        const sRes = await query('SELECT id FROM students WHERE user_id = $1', [decoded.id])
        if (sRes.rowCount === 0) return NextResponse.json({ error: 'Student not found' }, { status: 404 })
        const studentId = sRes.rows[0].id

        const res = await query(
            `INSERT INTO service_requests (student_id, service_type, description, status)
             VALUES ($1, $2, $3, 'pending') RETURNING *`,
            [studentId, service_type, description]
        )

        return NextResponse.json(res.rows[0], { status: 201 })

    } catch (error) {
        console.error('[KL-ERP] Service Request POST error:', error)
        return NextResponse.json({ error: 'Failed to create request' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const decoded: any = verifyToken(token.value)
        if (decoded.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const body = await request.json()
        const { id, status, admin_remarks } = body

        const res = await query(
            `UPDATE service_requests 
             SET status = $1, admin_remarks = $2, updated_at = NOW()
             WHERE id = $3 RETURNING *`,
            [status, admin_remarks, id]
        )

        return NextResponse.json(res.rows[0])

    } catch (error) {
        console.error('[KL-ERP] Service Request PUT error:', error)
        return NextResponse.json({ error: 'Failed to update request' }, { status: 500 })
    }
}
