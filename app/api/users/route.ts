import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getCache, setCache, invalidateCache } from '@/lib/cache'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const role = searchParams.get('role')

        const cacheKey = role ? `users:list:${role}` : 'users:list:all'
        const cachedData = await getCache(cacheKey)

        if (cachedData) {
            return NextResponse.json(cachedData)
        }

        let queryText = 'SELECT id, email, full_name, role, is_active, created_at FROM users'
        const params: any[] = []

        if (role) {
            queryText += ' WHERE role = $1'
            params.push(role)
        }

        queryText += ' ORDER BY created_at DESC'

        const res = await query(queryText, params)
        const users = res.rows

        await setCache(cacheKey, users, 60) // Cache for 1 minute

        return NextResponse.json(users)
    } catch (error) {
        console.error('[KL-ERP] Users GET error:', error)
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, password, full_name, role, department } = body

        if (!email || !password || !full_name || !role) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Check if user exists
        const existingUser = await query('SELECT id FROM users WHERE email = $1', [email])
        if ((existingUser.rowCount ?? 0) > 0) {
            return NextResponse.json({ error: 'User already exists' }, { status: 409 })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        // Start transaction ideally, but for now simple insert
        const userRes = await query(
            'INSERT INTO users (email, password_hash, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, full_name, role, created_at',
            [email, hashedPassword, full_name, role]
        )
        const newUser = userRes.rows[0]

        // If student or faculty, create related record
        if (role === 'student') {
            // We need department_id, but for now we might only have department name or nothing.
            // This is a simplification. Ideally we fetch department_id from name.
            // For now, we just create the user. The student record creation should happen in a separate step or improved here.
            // Let's try to create a basic student record if we can.
            await query('INSERT INTO students (user_id, enrollment_number, enrollment_date, full_name) VALUES ($1, $2, NOW(), $3)',
                [newUser.id, `STU${Date.now()}`, full_name]
            )
        } else if (role === 'faculty') {
            await query('INSERT INTO faculty (user_id, employee_id, date_of_joining) VALUES ($1, $2, NOW())',
                [newUser.id, `FAC${Date.now()}`]
            )
        }

        await invalidateCache('users:list:*')

        return NextResponse.json(newUser, { status: 201 })
    } catch (error) {
        console.error('[KL-ERP] Users POST error:', error)
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const { id, email, full_name, role, status } = body

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 })
        }

        const res = await query(
            'UPDATE users SET email = $1, full_name = $2, role = $3, is_active = $4, updated_at = NOW() WHERE id = $5 RETURNING id, email, full_name, role, is_active',
            [email, full_name, role, status === 'active', id]
        )

        if (res.rowCount === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        await invalidateCache('users:list:*')

        return NextResponse.json(res.rows[0])
    } catch (error) {
        console.error('[KL-ERP] Users PUT error:', error)
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 })
        }

        const res = await query('DELETE FROM users WHERE id = $1 RETURNING id', [id])

        if (res.rowCount === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        await invalidateCache('users:list:*')

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[KL-ERP] Users DELETE error:', error)
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
    }
}
