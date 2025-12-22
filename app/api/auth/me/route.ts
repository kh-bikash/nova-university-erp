import { type NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = verifyToken(token.value)
    if (!decoded || !decoded.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const res = await query('SELECT id, email, full_name, role, avatar_url FROM users WHERE id = $1', [decoded.id])
    if (res.rowCount === 0) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    return NextResponse.json(res.rows[0])
  } catch (error) {
    console.error('[KL-ERP] Auth check error:', error)
    return NextResponse.json({ error: 'Auth check failed' }, { status: 401 })
  }
}
