
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { query } from '@/lib/db'
import { apiResponse, handleApiError } from '@/lib/api-utils'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== 'student') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get student ID
        const sRes = await query('SELECT id FROM students WHERE user_id = $1', [user.id])
        if (sRes.rowCount === 0) return NextResponse.json({ error: 'Student not found' }, { status: 404 })
        const student = sRes.rows[0]

        // Fetch requests
        const sql = `
            SELECT id, service_type, description, status, admin_remarks, request_date, updated_at
            FROM service_requests
            WHERE student_id = $1
            ORDER BY request_date DESC
        `

        const res = await query(sql, [student.id])

        return apiResponse(res.rows)

    } catch (error) {
        return handleApiError(error)
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== 'student') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { serviceType, description } = body

        if (!serviceType) {
            return NextResponse.json({ error: 'Service Type is required' }, { status: 400 })
        }

        // Get student ID
        const sRes = await query('SELECT id FROM students WHERE user_id = $1', [user.id])
        if (sRes.rowCount === 0) return NextResponse.json({ error: 'Student not found' }, { status: 404 })
        const studentId = sRes.rows[0].id

        // Create request
        await query(
            'INSERT INTO service_requests (student_id, service_type, description) VALUES ($1, $2, $3)',
            [studentId, serviceType, description]
        )

        return apiResponse({ message: 'Service request submitted successfully' })

    } catch (error) {
        return handleApiError(error)
    }
}
