import { NextResponse, type NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const decoded: any = verifyToken(token.value)
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const searchParams = request.nextUrl.searchParams
        const userId = searchParams.get('user_id')

        let targetUserId = decoded.id
        if (userId && (decoded.role === 'admin' || decoded.role === 'faculty')) {
            targetUserId = userId
        }

        const res = await query(
            'SELECT * FROM documents WHERE user_id = $1 ORDER BY uploaded_at DESC',
            [targetUserId]
        )

        return NextResponse.json(res.rows)
    } catch (error) {
        console.error('[KL-ERP] Documents GET error:', error)
        return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const decoded: any = verifyToken(token.value)
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const formData = await request.formData()
        const file = formData.get('file') as File
        const title = formData.get('title') as string
        const type = formData.get('type') as string

        if (!file || !title || !type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // In a real app, upload to S3/Blob storage
        // Here we simulate upload and return a fake URL
        const fileName = `${Date.now()}-${file.name}`
        const fileUrl = `/uploads/${fileName}` // Mock URL

        const res = await query(
            `INSERT INTO documents (user_id, title, type, file_url, file_type, file_size, status)
             VALUES ($1, $2, $3, $4, $5, $6, 'pending') RETURNING *`,
            [decoded.id, title, type, fileUrl, file.type, file.size]
        )

        return NextResponse.json(res.rows[0], { status: 201 })
    } catch (error) {
        console.error('[KL-ERP] Documents POST error:', error)
        return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 })
    }
}
