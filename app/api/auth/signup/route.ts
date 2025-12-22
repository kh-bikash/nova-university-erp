import { type NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { query } from '@/lib/db'
import { signToken } from '@/lib/auth'

const SALT_ROUNDS = 10

export async function POST(request: NextRequest) {
  try {
    const { email, password, full_name, role, adminSecret } = await request.json()

    if (!email || !password || !full_name || !role) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    if (!email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const validRoles = ['student', 'faculty', 'admin', 'parent', 'staff']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role selected' }, { status: 400 })
    }

    if (role === 'admin') {
      const secret = process.env.ADMIN_SECRET || 'admin-secret-123'
      if (adminSecret !== secret) {
        return NextResponse.json({ error: 'Invalid admin secret' }, { status: 403 })
      }
    }

    // ensure no existing user with same email
    const exists = await query('SELECT id FROM users WHERE email = $1', [email])
    if ((exists.rowCount ?? 0) > 0) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
    }

    const password_hash = await hash(password, SALT_ROUNDS)

    const insert = await query(
      `INSERT INTO users (email, password_hash, full_name, role, created_at, updated_at)
       VALUES ($1,$2,$3,$4,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP) RETURNING id, email, full_name, role`,
      [email, password_hash, full_name, role]
    )

    const user = insert.rows[0]

    // If role is faculty, create a faculty record
    if (role === 'faculty') {
      try {
        await query(
          `INSERT INTO faculty (user_id, employee_id, date_of_joining)
           VALUES ($1, $2, CURRENT_TIMESTAMP)
           ON CONFLICT (user_id) DO NOTHING`,
          [user.id, `FAC-${Date.now()}`]
        )
      } catch (err) {
        console.warn('[KL-ERP] Could not create faculty record:', err)
        // Continue anyway - user account is created
      }
    }

    const token = signToken({ id: user.id, role: user.role })

    const response = NextResponse.json(user, { status: 201 })
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (error) {
    console.error('[KL-ERP] Signup error:', error)
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 })
  }
}

