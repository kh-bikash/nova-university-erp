import { NextResponse, type NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const decoded: any = verifyToken(token.value)
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        // If student, return their subscription
        if (decoded.role === 'student') {
            const sRes = await query('SELECT id FROM students WHERE user_id = $1', [decoded.id])
            if (sRes.rowCount === 0) return NextResponse.json(null)

            const studentId = sRes.rows[0].id
            const subRes = await query(`
                SELECT st.*, tr.route_name, tr.vehicle_number, tr.driver_name, tr.driver_contact, ts.stop_name, ts.pickup_time, ts.fee_amount
                FROM student_transport st
                JOIN transport_routes tr ON st.route_id = tr.id
                JOIN transport_stops ts ON st.stop_id = ts.id
                WHERE st.student_id = $1 AND st.status = 'active'
            `, [studentId])

            return NextResponse.json(subRes.rows[0] || null)
        }

        // If admin, return all subscriptions (optional)
        return NextResponse.json([])

    } catch (error) {
        console.error('[KL-ERP] Transport Subscription GET error:', error)
        return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 })
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
        const { route_id, stop_id, academic_year } = body

        if (!route_id || !stop_id || !academic_year) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const sRes = await query('SELECT id FROM students WHERE user_id = $1', [decoded.id])
        if (sRes.rowCount === 0) return NextResponse.json({ error: 'Student not found' }, { status: 404 })
        const studentId = sRes.rows[0].id

        // Check if already subscribed
        const existing = await query(
            `SELECT * FROM student_transport WHERE student_id = $1 AND academic_year = $2`,
            [studentId, academic_year]
        )
        if ((existing.rowCount ?? 0) > 0) {
            return NextResponse.json({ error: 'Already subscribed for this year' }, { status: 400 })
        }

        // Subscribe
        const res = await query(
            `INSERT INTO student_transport (student_id, route_id, stop_id, academic_year, status)
             VALUES ($1, $2, $3, $4, 'active') RETURNING *`,
            [studentId, route_id, stop_id, academic_year]
        )

        return NextResponse.json(res.rows[0], { status: 201 })

    } catch (error) {
        console.error('[KL-ERP] Transport Subscription POST error:', error)
        return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
    }
}
