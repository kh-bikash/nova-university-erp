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
        const hostelId = searchParams.get('hostel_id')

        if (hostelId) {
            // Get rooms for a specific hostel
            const roomsRes = await query(
                `SELECT * FROM hostel_rooms WHERE hostel_id = $1 ORDER BY room_number`,
                [hostelId]
            )
            return NextResponse.json(roomsRes.rows)
        }

        // Get all hostels
        const hostelsRes = await query(`
        SELECT h.*, 
        (SELECT COUNT(*) FROM hostel_rooms r WHERE r.hostel_id = h.id) as room_count,
        (SELECT COALESCE(SUM(current_occupancy), 0) FROM hostel_rooms r WHERE r.hostel_id = h.id) as current_occupancy
        FROM hostels h
        ORDER BY h.name
    `)

        return NextResponse.json(hostelsRes.rows)
    } catch (error) {
        console.error('[KL-ERP] Hostel GET error:', error)
        return NextResponse.json({ error: 'Failed to fetch hostels' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const decoded: any = verifyToken(token.value)
        if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'staff')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const body = await request.json()
        const { type } = body // 'hostel' or 'room'

        if (type === 'hostel') {
            const { name, gender_type, total_rooms, capacity_per_room, warden_faculty_id } = body
            const res = await query(
                `INSERT INTO hostels (name, gender_type, total_rooms, capacity_per_room, warden_faculty_id)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
                [name, gender_type, total_rooms, capacity_per_room, warden_faculty_id]
            )
            return NextResponse.json(res.rows[0], { status: 201 })
        } else if (type === 'room') {
            const { hostel_id, room_number, room_type, capacity } = body
            const res = await query(
                `INSERT INTO hostel_rooms (hostel_id, room_number, room_type, capacity)
             VALUES ($1, $2, $3, $4) RETURNING *`,
                [hostel_id, room_number, room_type, capacity]
            )
            return NextResponse.json(res.rows[0], { status: 201 })
        }

        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    } catch (error) {
        console.error('[KL-ERP] Hostel POST error:', error)
        return NextResponse.json({ error: 'Failed to create hostel/room' }, { status: 500 })
    }
}
