import { NextResponse, type NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const decoded: any = verifyToken(token.value)
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        // If admin, return all tickets
        // If faculty/staff, return their tickets (or all if they are maintenance staff - simplified here)

        let queryText = `
            SELECT mt.*, ia.name as asset_name, ia.location as asset_location, u.full_name as reporter_name
            FROM maintenance_tickets mt
            LEFT JOIN infrastructure_assets ia ON mt.asset_id = ia.id
            JOIN users u ON mt.reported_by = u.id
            WHERE 1=1
        `
        const params: any[] = []

        if (decoded.role !== 'admin') {
            // For now, let faculty see only their tickets
            queryText += ` AND mt.reported_by = $1`
            params.push(decoded.id)
        }

        queryText += ` ORDER BY mt.created_at DESC`

        const res = await query(queryText, params)
        return NextResponse.json(res.rows)

    } catch (error) {
        console.error('[KL-ERP] Maintenance Tickets GET error:', error)
        return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const decoded: any = verifyToken(token.value)
        // Students usually report to warden/faculty, but let's allow faculty/admin to report here
        if (decoded.role === 'student') {
            return NextResponse.json({ error: 'Students should report to Faculty/Warden' }, { status: 403 })
        }

        const body = await request.json()
        const { asset_id, title, description, priority } = body

        if (!title) {
            return NextResponse.json({ error: 'Title required' }, { status: 400 })
        }

        const res = await query(
            `INSERT INTO maintenance_tickets (asset_id, reported_by, title, description, priority, status)
             VALUES ($1, $2, $3, $4, $5, 'open') RETURNING *`,
            [asset_id, decoded.id, title, description, priority || 'medium']
        )

        return NextResponse.json(res.rows[0], { status: 201 })

    } catch (error) {
        console.error('[KL-ERP] Maintenance Ticket POST error:', error)
        return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 })
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
        const { id, status, assigned_to, resolution_notes } = body

        let queryText = `UPDATE maintenance_tickets SET status = $1, assigned_to = $2, resolution_notes = $3`
        const params = [status, assigned_to, resolution_notes]

        if (status === 'resolved' || status === 'closed') {
            queryText += `, resolved_at = NOW()`
        }

        queryText += ` WHERE id = $4 RETURNING *`
        params.push(id)

        const res = await query(queryText, params)

        return NextResponse.json(res.rows[0])

    } catch (error) {
        console.error('[KL-ERP] Maintenance Ticket PUT error:', error)
        return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 })
    }
}
