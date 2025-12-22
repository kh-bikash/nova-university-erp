import { NextResponse, type NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const decoded: any = verifyToken(token.value)
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        // Get assets
        const assetsRes = await query(`
        SELECT * FROM infrastructure_assets ORDER BY name
    `)

        return NextResponse.json(assetsRes.rows)
    } catch (error) {
        console.error('[KL-ERP] Infrastructure Assets GET error:', error)
        return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 })
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
        const { name, type, location, purchase_date, warranty_expiry } = body

        if (!name || !type) {
            return NextResponse.json({ error: 'Name and Type required' }, { status: 400 })
        }

        const res = await query(
            `INSERT INTO infrastructure_assets (name, type, location, purchase_date, warranty_expiry)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [name, type, location, purchase_date, warranty_expiry]
        )

        return NextResponse.json(res.rows[0], { status: 201 })
    } catch (error) {
        console.error('[KL-ERP] Infrastructure Assets POST error:', error)
        return NextResponse.json({ error: 'Failed to create asset' }, { status: 500 })
    }
}
