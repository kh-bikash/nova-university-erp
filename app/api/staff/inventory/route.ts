import { NextResponse, type NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
    // ... auth ...
    const token = request.cookies.get('auth-token')
    const decoded: any = verifyToken(token?.value || '')
    if (!token || decoded.role !== 'staff') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const res = await query('SELECT * FROM inventory_items ORDER BY item_name ASC')
    return NextResponse.json(res.rows)
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { item_name, category, quantity, unit, min_threshold, location } = body
        await query(`
            INSERT INTO inventory_items (item_name, category, quantity, unit, min_threshold, location, last_restocked)
            VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE)
        `, [item_name, category, quantity, unit, min_threshold, location])
        return NextResponse.json({ success: true })
    } catch (e) {
        return NextResponse.json({ error: 'Error' }, { status: 500 })
    }
}
