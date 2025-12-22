import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getCache, setCache, invalidateCache, deleteCache } from '@/lib/cache'

export async function GET(request: NextRequest) {
    try {
        const queryText = `
            SELECT 
                d.*,
                (SELECT COUNT(*)::int FROM faculty f WHERE f.department_id = d.id) as faculty_count,
                (SELECT COUNT(*)::int FROM students s WHERE s.department_id = d.id) as student_count
            FROM departments d 
            ORDER BY d.name
        `
        const res = await query(queryText)
        return NextResponse.json(res.rows)
    } catch (error) {
        console.error('[KL-ERP] Departments GET error:', error)
        return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, code, description, head_faculty_id, budget } = body

        if (!name || !code) {
            return NextResponse.json({ error: 'Name and Code are required' }, { status: 400 })
        }

        const res = await query(
            'INSERT INTO departments (name, code, description, head_faculty_id, budget) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, code, description, head_faculty_id || null, budget || 0]
        )

        await deleteCache('departments:list')

        return NextResponse.json(res.rows[0], { status: 201 })
    } catch (error) {
        console.error('[KL-ERP] Departments POST error:', error)
        return NextResponse.json({ error: 'Failed to create department' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const { id, name, code, description, head_faculty_id, budget } = body

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 })
        }

        const res = await query(
            'UPDATE departments SET name = $1, code = $2, description = $3, head_faculty_id = $4, budget = $5, updated_at = NOW() WHERE id = $6 RETURNING *',
            [name, code, description, head_faculty_id || null, budget || 0, id]
        )

        if (res.rowCount === 0) {
            return NextResponse.json({ error: 'Department not found' }, { status: 404 })
        }

        await deleteCache('departments:list')

        return NextResponse.json(res.rows[0])
    } catch (error) {
        console.error('[KL-ERP] Departments PUT error:', error)
        return NextResponse.json({ error: 'Failed to update department' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 })
        }

        const res = await query('DELETE FROM departments WHERE id = $1 RETURNING id', [id])

        if (res.rowCount === 0) {
            return NextResponse.json({ error: 'Department not found' }, { status: 404 })
        }

        await deleteCache('departments:list')

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[KL-ERP] Departments DELETE error:', error)
        return NextResponse.json({ error: 'Failed to delete department' }, { status: 500 })
    }
}
