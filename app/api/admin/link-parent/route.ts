import { NextResponse, type NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const decoded: any = verifyToken(token.value)
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const body = await request.json()
        const { student_user_id, parent_email, relationship } = body

        if (!student_user_id || !parent_email) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // 1. Find Student ID from User ID
        const studentRes = await query('SELECT id FROM students WHERE user_id = $1', [student_user_id])
        if (studentRes.rowCount === 0) {
            return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })
        }
        const studentId = studentRes.rows[0].id

        // 2. Find Parent by Email
        const parentUserRes = await query('SELECT id FROM users WHERE email = $1 AND role = $2', [parent_email, 'parent'])
        if (parentUserRes.rowCount === 0) {
            return NextResponse.json({ error: 'Parent user not found with this email' }, { status: 404 })
        }
        const parentUserId = parentUserRes.rows[0].id

        // 3. Find Parent Profile ID
        let parentRes = await query('SELECT id FROM parents WHERE user_id = $1', [parentUserId])
        let parentId
        if (parentRes.rowCount === 0) {
            // Create parent profile if missing
            const newParent = await query('INSERT INTO parents (user_id) VALUES ($1) RETURNING id', [parentUserId])
            parentId = newParent.rows[0].id
        } else {
            parentId = parentRes.rows[0].id
        }

        // 4. Link
        await query(`
            INSERT INTO parent_students (parent_id, student_id, relationship)
            VALUES ($1, $2, $3)
            ON CONFLICT (parent_id, student_id) DO NOTHING
        `, [parentId, studentId, relationship || 'Guardian'])

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('[KL-ERP] Link Parent error:', error)
        return NextResponse.json({ error: 'Failed to link parent' }, { status: 500 })
    }
}
