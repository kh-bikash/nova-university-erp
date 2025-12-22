import { NextResponse, type NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const decoded: any = verifyToken(token.value)
        if (!decoded || decoded.role !== 'student') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const res = await query(`
            SELECT s.*, u.full_name, u.email, d.name as department_name
            FROM students s
            JOIN users u ON s.user_id = u.id
            LEFT JOIN departments d ON s.department_id = d.id
            WHERE s.user_id = $1
        `, [decoded.id])

        if (res.rowCount === 0) {
            console.log('[KL-ERP] Profile not found for user:', decoded.id, '- Creating one now...')

            // Auto-create profile
            const enrollmentNumber = 'ENR' + Date.now()
            const newStudent = await query(`
                INSERT INTO students (user_id, enrollment_number, enrollment_date)
                VALUES ($1, $2, NOW())
                RETURNING *
            `, [decoded.id, enrollmentNumber])

            if (newStudent.rowCount > 0) {
                console.log('[KL-ERP] Created new profile:', newStudent.rows[0].id)
                // Fetch full details again to match the SELECT structure (with joins)
                const fullProfile = await query(`
                    SELECT s.*, u.full_name, u.email, d.name as department_name
                    FROM students s
                    JOIN users u ON s.user_id = u.id
                    LEFT JOIN departments d ON s.department_id = d.id
                    WHERE s.id = $1
                `, [newStudent.rows[0].id])

                return NextResponse.json(fullProfile.rows[0])
            }

            return NextResponse.json({ error: 'Failed to create student profile' }, { status: 500 })
        }

        console.log('[KL-ERP] Profile found:', res.rows[0].id)
        return NextResponse.json(res.rows[0])

    } catch (error) {
        console.error('[KL-ERP] Student Profile GET error:', error)
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
    }
}
