import { NextResponse, type NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const decoded: any = verifyToken(token.value)
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        // If student, return their allocation
        if (decoded.role === 'student') {
            const sRes = await query('SELECT id FROM students WHERE user_id = $1', [decoded.id])
            if (sRes.rowCount === 0) return NextResponse.json(null)

            const studentId = sRes.rows[0].id
            const allocRes = await query(`
                SELECT ha.*, hr.room_number, h.name as hostel_name, hr.room_type
                FROM hostel_allocations ha
                JOIN hostel_rooms hr ON ha.room_id = hr.id
                JOIN hostels h ON hr.hostel_id = h.id
                WHERE ha.student_id = $1 AND ha.status = 'allocated'
            `, [studentId])

            return NextResponse.json(allocRes.rows[0] || null)
        }

        // If admin or staff, return all allocations
        if (decoded.role === 'admin' || decoded.role === 'staff') {
            const allAllocRes = await query(`
                SELECT ha.*, hr.room_number, h.name as hostel_name, u.full_name as student_name, s.enrollment_number
                FROM hostel_allocations ha
                JOIN hostel_rooms hr ON ha.room_id = hr.id
                JOIN hostels h ON hr.hostel_id = h.id
                JOIN students s ON ha.student_id = s.id
                JOIN users u ON s.user_id = u.id
                ORDER BY ha.created_at DESC
            `)
            return NextResponse.json(allAllocRes.rows)
        }

    } catch (error) {
        console.error('[KL-ERP] Allocation GET error:', error)
        return NextResponse.json({ error: 'Failed to fetch allocation' }, { status: 500 })
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
        const { student_id, room_id, academic_year } = body

        if (!student_id || !room_id || !academic_year) {
            console.log("Allocation 400: Missing fields", { student_id, room_id, academic_year })
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Check room capacity
        const roomRes = await query('SELECT * FROM hostel_rooms WHERE id = $1', [room_id])
        if (roomRes.rowCount === 0) return NextResponse.json({ error: 'Room not found' }, { status: 404 })

        const room = roomRes.rows[0]
        if (room.current_occupancy >= room.capacity) {
            console.log("Allocation 400: Room full", { current: room.current_occupancy, cap: room.capacity })
            return NextResponse.json({ error: 'Room is full' }, { status: 400 })
        }

        // Check if student already allocated
        const existing = await query(
            `SELECT * FROM hostel_allocations WHERE student_id = $1 AND status = 'allocated'`,
            [student_id]
        )
        if ((existing.rowCount ?? 0) > 0) {
            console.log("Allocation 400: Student already allocated", student_id)
            return NextResponse.json({ error: 'Student already allocated a room' }, { status: 400 })
        }

        // Allocate
        const res = await query(
            `INSERT INTO hostel_allocations (student_id, room_id, academic_year, status)
             VALUES ($1, $2, $3, 'allocated') RETURNING *`,
            [student_id, room_id, academic_year]
        )

        // Update room occupancy
        await query(
            `UPDATE hostel_rooms SET current_occupancy = current_occupancy + 1 WHERE id = $1`,
            [room_id]
        )

        return NextResponse.json(res.rows[0], { status: 201 })

    } catch (error) {
        console.error('[KL-ERP] Allocation POST error:', error)
        return NextResponse.json({ error: 'Failed to allocate room' }, { status: 500 })
    }
}
