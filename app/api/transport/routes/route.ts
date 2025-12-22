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
        const routeId = searchParams.get('route_id')

        if (routeId) {
            // Get stops for a specific route
            const stopsRes = await query(
                `SELECT * FROM transport_stops WHERE route_id = $1 ORDER BY pickup_time`,
                [routeId]
            )
            return NextResponse.json(stopsRes.rows)
        }

        // Get all routes
        const routesRes = await query(`
        SELECT tr.*, 
        (SELECT COUNT(*) FROM transport_stops ts WHERE ts.route_id = tr.id) as stop_count,
        (SELECT COUNT(*) FROM student_transport st WHERE st.route_id = tr.id AND st.status = 'active') as active_subscribers
        FROM transport_routes tr
        ORDER BY tr.route_number
    `)

        return NextResponse.json(routesRes.rows)
    } catch (error) {
        console.error('[KL-ERP] Transport Routes GET error:', error)
        return NextResponse.json({ error: 'Failed to fetch routes' }, { status: 500 })
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
        const { type } = body // 'route' or 'stop'

        if (type === 'route') {
            const { route_number, route_name, driver_name, driver_contact, vehicle_number, capacity } = body
            const res = await query(
                `INSERT INTO transport_routes (route_number, route_name, driver_name, driver_contact, vehicle_number, capacity)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                [route_number, route_name, driver_name, driver_contact, vehicle_number, capacity]
            )
            return NextResponse.json(res.rows[0], { status: 201 })
        } else if (type === 'stop') {
            const { route_id, stop_name, pickup_time, fee_amount } = body
            const res = await query(
                `INSERT INTO transport_stops (route_id, stop_name, pickup_time, fee_amount)
             VALUES ($1, $2, $3, $4) RETURNING *`,
                [route_id, stop_name, pickup_time, fee_amount]
            )
            return NextResponse.json(res.rows[0], { status: 201 })
        }

        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    } catch (error) {
        console.error('[KL-ERP] Transport Routes POST error:', error)
        return NextResponse.json({ error: 'Failed to create route/stop' }, { status: 500 })
    }
}
