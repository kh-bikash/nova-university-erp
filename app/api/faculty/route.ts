import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getCache, setCache, invalidateCache, deleteCache } from '@/lib/cache'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
    try {
        // const cacheKey = 'faculty:list'
        // const cachedData = await getCache(cacheKey)

        // if (cachedData) {
        //     return NextResponse.json(cachedData)
        // }

        // Join with users and departments to get readable names
        const queryText = `
      SELECT 
        f.*, 
        u.full_name, 
        u.email, 
        u.phone_number,
        d.name as department_name 
      FROM faculty f
      JOIN users u ON f.user_id = u.id
      LEFT JOIN departments d ON f.department_id = d.id
      ORDER BY u.full_name
    `
        const res = await query(queryText)
        const faculty = res.rows

        // await setCache(cacheKey, faculty, 60)

        return NextResponse.json(faculty)
    } catch (error) {
        console.error('[KL-ERP] Faculty GET error:', error)
        return NextResponse.json({ error: 'Failed to fetch faculty' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const {
            email, password, full_name,
            employee_id, department_id, specialization,
            qualification, experience_years, office_location
        } = body

        if (!email || !password || !full_name || !employee_id) {
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
            [email, hashedPassword, full_name, 'faculty']
        )
        const userId = userRes.rows[0].id

        // 2. Create Faculty Profile
        const facultyRes = await query(
            `INSERT INTO faculty (
        user_id, employee_id, department_id, specialization, 
        date_of_joining, qualification, experience_years, office_location
      ) VALUES ($1, $2, $3, $4, NOW(), $5, $6, $7) RETURNING *`,
            [
                userId, employee_id, department_id || null, specialization,
                qualification, experience_years || 0, office_location
            ]
        )

        await deleteCache('faculty:list')
        await invalidateCache('users:list:*') // Invalidate users cache too since we added a user

        return NextResponse.json(facultyRes.rows[0], { status: 201 })
    } catch (error) {
        console.error('[KL-ERP] Faculty POST error:', error)
        return NextResponse.json({ error: 'Failed to create faculty' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const {
            id, full_name, email,
            department_id, specialization,
            qualification, experience_years, office_location
        } = body

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 })
        }

        // Update Faculty details
        const facultyRes = await query(
            `UPDATE faculty SET 
        department_id = $1, specialization = $2, 
        qualification = $3, experience_years = $4, office_location = $5,
        updated_at = NOW()
       WHERE id = $6 RETURNING user_id`,
            [department_id || null, specialization, qualification, experience_years, office_location, id]
        )

        if (facultyRes.rowCount === 0) {
            return NextResponse.json({ error: 'Faculty not found' }, { status: 404 })
        }

        const userId = facultyRes.rows[0].user_id

        // Update User details (name, email)
        if (full_name || email) {
            await query(
                'UPDATE users SET full_name = COALESCE($1, full_name), email = COALESCE($2, email) WHERE id = $3',
                [full_name, email, userId]
            )
        }

        await deleteCache('faculty:list')
        await invalidateCache('users:list:*')

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[KL-ERP] Faculty PUT error:', error)
        return NextResponse.json({ error: 'Failed to update faculty' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 })
        }

        // Get user_id before deleting faculty to delete user as well (optional, but cleaner)
        // Or we rely on ON DELETE CASCADE if we delete the user.
        // But here we are deleting the faculty profile.
        // If we delete faculty profile, the user record remains as 'faculty' role but without profile?
        // Better to delete the user record if it's a dedicated faculty account.

        const facultyRes = await query('SELECT user_id FROM faculty WHERE id = $1', [id])
        if (facultyRes.rowCount === 0) {
            return NextResponse.json({ error: 'Faculty not found' }, { status: 404 })
        }
        const userId = facultyRes.rows[0].user_id

        // Delete User (Cascade will delete Faculty)
        await query('DELETE FROM users WHERE id = $1', [userId])

        await deleteCache('faculty:list')
        await invalidateCache('users:list:*')

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[KL-ERP] Faculty DELETE error:', error)
        return NextResponse.json({ error: 'Failed to delete faculty' }, { status: 500 })
    }
}
