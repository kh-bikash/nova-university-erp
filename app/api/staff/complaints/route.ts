import { NextResponse, type NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')
        const decoded: any = verifyToken(token?.value || '')
        if (!decoded || decoded.role !== 'staff') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

        const res = await query(`
            SELECT gc.*, u.full_name as submitted_by_name 
            FROM general_complaints gc
            LEFT JOIN users u ON gc.submitted_by = u.id
            ORDER BY gc.created_at DESC
        `)
        return NextResponse.json(res.rows)
    } catch (e) {
        return NextResponse.json({ error: 'Error' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const { id, status } = body
        await query(`UPDATE general_complaints SET status = $1 WHERE id = $2`, [status, id])
        return NextResponse.json({ success: true })
    } catch (e) {
        return NextResponse.json({ error: 'Error' }, { status: 500 })
    }
}
