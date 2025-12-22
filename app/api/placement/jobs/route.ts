import { NextResponse, type NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const decoded: any = verifyToken(token.value)
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        // Get active jobs
        const jobsRes = await query(`
        SELECT jp.*, c.name as company_name, c.industry, c.website,
        (SELECT COUNT(*) FROM job_applications ja WHERE ja.job_id = jp.id) as applicant_count
        FROM job_postings jp
        JOIN companies c ON jp.company_id = c.id
        WHERE jp.is_active = true
        ORDER BY jp.posted_date DESC
    `)

        return NextResponse.json(jobsRes.rows)
    } catch (error) {
        console.error('[KL-ERP] Placement Jobs GET error:', error)
        return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const decoded: any = verifyToken(token.value)
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const body = await request.json()
        const { type } = body // 'company' or 'job'

        if (type === 'company') {
            const { name, industry, website, contact_email, contact_phone, address } = body
            const res = await query(
                `INSERT INTO companies (name, industry, website, contact_email, contact_phone, address)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                [name, industry, website, contact_email, contact_phone, address]
            )
            return NextResponse.json(res.rows[0], { status: 201 })
        } else if (type === 'job') {
            const { company_id, title, description, requirements, location, salary_range, job_type, deadline_date } = body
            const res = await query(
                `INSERT INTO job_postings (company_id, title, description, requirements, location, salary_range, job_type, deadline_date)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
                [company_id, title, description, requirements, location, salary_range, job_type, deadline_date]
            )
            return NextResponse.json(res.rows[0], { status: 201 })
        }

        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    } catch (error) {
        console.error('[KL-ERP] Placement Jobs POST error:', error)
        return NextResponse.json({ error: 'Failed to create company/job' }, { status: 500 })
    }
}
