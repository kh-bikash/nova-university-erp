import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getCache, setCache, invalidateCache, deleteCache } from '@/lib/cache'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    const queryText = `
      SELECT 
        s.*, 
        u.full_name, 
        u.email, 
        u.phone_number,
        d.name as department_name 
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN departments d ON s.department_id = d.id
      ORDER BY u.full_name
    `
    const res = await query(queryText)
    return NextResponse.json(res.rows)
  } catch (error) {
    console.error('[KL-ERP] Students GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      email, password, full_name,
      enrollment_number, department_id, semester,
      date_of_birth, gender, blood_group,
      father_name, father_contact, mother_name, mother_contact,
      address
    } = body

    if (!email || !password || !full_name || !enrollment_number) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 1. Create User
    const hashedPassword = await bcrypt.hash(password, 10)

    // Check if user exists
    const userCheck = await query('SELECT id FROM users WHERE email = $1', [email])
    if ((userCheck.rowCount ?? 0) > 0) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 })
    }

    const userRes = await query(
      'INSERT INTO users (email, password_hash, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id',
      [email, hashedPassword, full_name, 'student']
    )
    const userId = userRes.rows[0].id

    // 2. Create Student Profile
    const studentRes = await query(
      `INSERT INTO students (
        user_id, enrollment_number, department_id, semester,
        date_of_birth, gender, blood_group,
        father_name, father_contact, mother_name, mother_contact,
        address, enrollment_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW()) RETURNING *`,
      [
        userId, enrollment_number, department_id || null, semester || 1,
        date_of_birth || null, gender || null, blood_group || null,
        father_name, father_contact, mother_name, mother_contact,
        address
      ]
    )

    await invalidateCache('users:list:*')

    return NextResponse.json(studentRes.rows[0], { status: 201 })
  } catch (error) {
    console.error('[KL-ERP] Student POST error:', error)
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      id, full_name, email,
      department_id, semester,
      address
    } = body

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    // Update Student details
    const studentRes = await query(
      `UPDATE students SET 
        department_id = $1, semester = $2, address = $3,
        updated_at = NOW()
       WHERE id = $4 RETURNING user_id`,
      [department_id || null, semester, address, id]
    )

    if (studentRes.rowCount === 0) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    const userId = studentRes.rows[0].user_id

    // Update User details
    if (full_name || email) {
      await query(
        'UPDATE users SET full_name = COALESCE($1, full_name), email = COALESCE($2, email) WHERE id = $3',
        [full_name, email, userId]
      )
    }

    await invalidateCache('users:list:*')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[KL-ERP] Student PUT error:', error)
    return NextResponse.json({ error: 'Failed to update student' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const studentRes = await query('SELECT user_id FROM students WHERE id = $1', [id])
    if (studentRes.rowCount === 0) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }
    const userId = studentRes.rows[0].user_id

    // Delete User (Cascade will delete Student)
    await query('DELETE FROM users WHERE id = $1', [userId])

    await invalidateCache('users:list:*')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[KL-ERP] Student DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 })
  }
}
