import { type NextRequest, NextResponse } from "next/server"
import { compare } from 'bcryptjs'
import { query } from '@/lib/db'
import { signToken, generateRefreshToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    if (!email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    const res = await query('SELECT id, email, password_hash, full_name, role FROM users WHERE email = $1', [email])
    if (res.rowCount === 0) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const user = res.rows[0]
    const match = await compare(password, user.password_hash)
    if (!match) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const accessToken = signToken({ id: user.id, role: user.role })
    const refreshToken = await generateRefreshToken(user.id)

    const response = NextResponse.json({ id: user.id, email: user.email, full_name: user.full_name, role: user.role })

    // Set Access Token Cookie (Short lived)
    response.cookies.set('auth-token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 15, // 15 minutes
      path: '/',
    })

    // Set Refresh Token Cookie (Long lived)
    response.cookies.set('refresh-token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('[KL-ERP] Login error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}
