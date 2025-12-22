import { NextResponse, type NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        // ... auth checks ...
        const token = request.cookies.get('auth-token')
        const decoded: any = verifyToken(token?.value || '')
        if (!decoded || decoded.role !== 'staff') return NextResponse.json({ error: 'Fors' }, { status: 403 })

        const res = await query(`
            SELECT ir.*, u.full_name as requester_name 
            FROM infrastructure_requests ir
            LEFT JOIN users u ON ir.requester_id = u.id
            ORDER BY ir.created_at DESC
        `)
        return NextResponse.json(res.rows)
    } catch (e) {
        return NextResponse.json({ error: 'Error' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const { id, status, assigned_to } = body
        await query(`
            UPDATE infrastructure_requests 
            SET status = COALESCE($1, status),
                assigned_to = COALESCE($2, assigned_to),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
         `, [status, assigned_to, id])
        return NextResponse.json({ success: true })
    } catch (e) {
        return NextResponse.json({ error: 'Error' }, { status: 500 })
    }
}
