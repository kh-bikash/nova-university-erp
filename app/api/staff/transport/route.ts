import { NextResponse, type NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
    const token = request.cookies.get('auth-token')
    const decoded: any = verifyToken(token?.value || '')
    if (!token || decoded.role !== 'staff') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const res = await query('SELECT * FROM transport_vehicles ORDER BY vehicle_number ASC')
    return NextResponse.json(res.rows)
}
