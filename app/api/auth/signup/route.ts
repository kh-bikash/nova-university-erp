import { type NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { query } from '@/lib/db'
import { signToken, generateRefreshToken } from '@/lib/auth'

const SALT_ROUNDS = 10

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const email = body.email
    const password = body.password
    const full_name = body.full_name
    const role = String(body.role || '').toLowerCase().trim()
    const adminSecret = body.adminSecret
    console.log('[SIGNUP] role received:', role)


    if (!email || !password || !full_name || !role) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    if (!email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
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

    // Check existing user
    const exists = await query('SELECT id FROM users WHERE email = $1', [email])
    if ((exists.rowCount ?? 0) > 0) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
    }

    const password_hash = await hash(password, SALT_ROUNDS)

    // Create user
    const insert = await query(
      `INSERT INTO users (email, password_hash, full_name, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id, email, full_name, role`,
      [email, password_hash, full_name, role]
    )

    const user = insert.rows[0]

    // Create faculty record
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
      }
    }

    // ✅ CREATE STUDENT RECORD (THIS WAS MISSING)
    if (role === 'student') {
      try {
        const deptRes = await query(
          `SELECT id FROM departments WHERE name = 'Computer Science' LIMIT 1`
        )

        if (deptRes.rowCount === 0) {
          throw new Error('Computer Science department not found')
        }

        const departmentId = deptRes.rows[0].id

        await query(
          `INSERT INTO students (user_id, department_id, semester)
           VALUES ($1, $2, $3)
           ON CONFLICT (user_id) DO NOTHING`,
          [user.id, departmentId, 1]
        )
      } catch (err) {
        console.error('[KL-ERP] Could not create student record:', err)
      }
    }

    // Tokens
    const accessToken = signToken({ id: user.id, role: user.role })
    const refreshToken = await generateRefreshToken(user.id)

    const response = NextResponse.json(user, { status: 201 })

    response.cookies.set('auth-token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 15, // 15 minutes
      path: '/',
    })

    response.cookies.set('refresh-token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('[KL-ERP] Signup error:', error)
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 })
  }
}
