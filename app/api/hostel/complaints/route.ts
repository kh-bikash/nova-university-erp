import { NextResponse, type NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const decoded: any = verifyToken(token.value)
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        let queryText = `
            SELECT hc.*, h.name as hostel_name, u.full_name as student_name, s.enrollment_number
            FROM hostel_complaints hc
            JOIN hostels h ON hc.hostel_id = h.id
            JOIN students s ON hc.student_id = s.id
            JOIN users u ON s.user_id = u.id
            WHERE 1=1
        `
        const params: any[] = []

        if (decoded.role === 'student') {
            const sRes = await query('SELECT id FROM students WHERE user_id = $1', [decoded.id])
            if (sRes.rowCount === 0) return NextResponse.json([])

            queryText += ` AND hc.student_id = $1`
            params.push(sRes.rows[0].id)
        }

        queryText += ` ORDER BY hc.created_at DESC`

        const res = await query(queryText, params)
        return NextResponse.json(res.rows)

    } catch (error) {
        console.error('[KL-ERP] Complaints GET error:', error)
        return NextResponse.json({ error: 'Failed to fetch complaints' }, { status: 500 })
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
        const { complaint_type, description } = body

        // Get student's hostel from allocation
        const sRes = await query('SELECT id FROM students WHERE user_id = $1', [decoded.id])
        if (sRes.rowCount === 0) return NextResponse.json({ error: 'Student not found' }, { status: 404 })
        const studentId = sRes.rows[0].id

        const allocRes = await query(`
            SELECT hr.hostel_id 
            FROM hostel_allocations ha
            JOIN hostel_rooms hr ON ha.room_id = hr.id
            WHERE ha.student_id = $1 AND ha.status = 'allocated'
        `, [studentId])

        if (allocRes.rowCount === 0) {
            return NextResponse.json({ error: 'You are not allocated to any hostel' }, { status: 400 })
        }
        const hostelId = allocRes.rows[0].hostel_id

        const res = await query(
            `INSERT INTO hostel_complaints (student_id, hostel_id, complaint_type, description)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [studentId, hostelId, complaint_type, description]
        )

        return NextResponse.json(res.rows[0], { status: 201 })

    } catch (error) {
        console.error('[KL-ERP] Complaints POST error:', error)
        return NextResponse.json({ error: 'Failed to raise complaint' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const decoded: any = verifyToken(token.value)
        if (decoded.role !== 'admin' && decoded.role !== 'faculty' && decoded.role !== 'staff') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const body = await request.json()
        const { id, status, resolution } = body

        const res = await query(
            `UPDATE hostel_complaints 
             SET status = $1, resolution = $2, resolved_at = NOW()
             WHERE id = $3 RETURNING *`,
            [status, resolution, id]
        )

        return NextResponse.json(res.rows[0])

    } catch (error) {
        console.error('[KL-ERP] Complaints PUT error:', error)
        return NextResponse.json({ error: 'Failed to update complaint' }, { status: 500 })
    }
}
