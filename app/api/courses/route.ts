import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getCache, setCache, invalidateCache, deleteCache } from '@/lib/cache'
import { requireAuth } from '@/lib/auth'
import { apiResponse, handleApiError, apiError } from '@/lib/api-utils'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const facultyIdParam = searchParams.get('faculty_id')
        const token = request.cookies.get('auth-token')

        // Base query
        let queryText = `
      SELECT 
        c.*, 
        d.name as department_name,
        u.full_name as faculty_name,
        (SELECT COUNT(*) FROM course_enrollment ce WHERE ce.course_id = c.id)::int as enrolled_count
      FROM courses c
      LEFT JOIN departments d ON c.department_id = d.id
      LEFT JOIN faculty f ON c.faculty_id = f.id
      LEFT JOIN users u ON f.user_id = u.id
    `

        const params: any[] = []
        let paramCount = 1
        let whereConditions = []

        // Handle faculty_id filter
        if (facultyIdParam) {
            if (facultyIdParam === 'me') {
                if (!token) return apiError('Unauthorized', 401)

                // Reuse verifyToken or parse manualy if needed, but requireAuth doesn't return payload easily in this structure without refactor.
                // Ideally use verifyToken from lib/auth
                const { verifyToken } = await import('@/lib/auth')
                const decoded: any = verifyToken(token.value)

                if (!decoded) return apiError('Invalid token', 401)

                if (decoded.role === 'faculty') {
                    const fRes = await query('SELECT id FROM faculty WHERE user_id = $1', [decoded.id])
                    if ((fRes.rowCount ?? 0) > 0) {
                        whereConditions.push(`c.faculty_id = $${paramCount}`)
                        params.push(fRes.rows[0].id)
                        paramCount++
                    } else {
                        return NextResponse.json({ success: true, data: [] }) // Faculty profile not found
                    }
                }
                // If not faculty role, ignore 'me' or return empty? Let's ignore or error. 
                // If admin asks for 'me' but is not faculty, it makes no sense.
            } else {
                whereConditions.push(`c.faculty_id = $${paramCount}`)
                params.push(facultyIdParam)
                paramCount++
            }
        }

        if (whereConditions.length > 0) {
            queryText += ' WHERE ' + whereConditions.join(' AND ')
        }

        queryText += ' ORDER BY c.course_name'

        const res = await query(queryText, params)
        return NextResponse.json({ success: true, data: res.rows })
    } catch (error) {
        return handleApiError(error)
    }
}

export async function POST(request: NextRequest) {
    try {
        // Only Admin can create courses
        await requireAuth(['admin'])

        const body = await request.json()
        const {
            course_code, course_name, department_id,
            credits, semester, description, faculty_id, max_students
        } = body

        if (!course_code || !course_name || !department_id || !credits || !semester) {
            return apiError('Missing required fields', 400)
        }

        const res = await query(
            `INSERT INTO courses (
        course_code, course_name, department_id, 
        credits, semester, description, faculty_id, max_students
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [
                course_code, course_name, department_id,
                credits, semester, description, faculty_id || null, max_students || 60
            ]
        )

        await deleteCache('courses:list')

        return apiResponse(res.rows[0], 201)
    } catch (error) {
        return handleApiError(error)
    }
}

export async function PUT(request: NextRequest) {
    try {
        // Only Admin can update courses
        await requireAuth(['admin'])

        const body = await request.json()
        const {
            id, course_name, department_id,
            credits, semester, description, faculty_id, max_students
        } = body

        if (!id) {
            return apiError('ID is required', 400)
        }

        const res = await query(
            `UPDATE courses SET 
        course_name = $1, department_id = $2, 
        credits = $3, semester = $4, description = $5, 
        faculty_id = $6, max_students = $7, updated_at = NOW()
       WHERE id = $8 RETURNING *`,
            [
                course_name, department_id,
                credits, semester, description, faculty_id || null, max_students, id
            ]
        )

        if (res.rowCount === 0) {
            return apiError('Course not found', 404)
        }

        await deleteCache('courses:list')

        return apiResponse(res.rows[0])
    } catch (error) {
        return handleApiError(error)
    }
}

export async function DELETE(request: NextRequest) {
    try {
        // Only Admin can delete courses
        await requireAuth(['admin'])

        const searchParams = request.nextUrl.searchParams
        const id = searchParams.get('id')

        if (!id) {
            return apiError('ID is required', 400)
        }

        const res = await query('DELETE FROM courses WHERE id = $1 RETURNING id', [id])

        if (res.rowCount === 0) {
            return apiError('Course not found', 404)
        }

        await deleteCache('courses:list')

        return apiResponse({ success: true })
    } catch (error) {
        return handleApiError(error)
    }
}
