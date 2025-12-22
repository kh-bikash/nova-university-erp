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
        const q = searchParams.get('q')

        let queryText = `SELECT * FROM library_books WHERE 1=1`
        const params: any[] = []

        if (q) {
            queryText += ` AND (title ILIKE $1 OR author ILIKE $1 OR isbn ILIKE $1)`
            params.push(`%${q}%`)
        }

        queryText += ` ORDER BY title ASC`

        const res = await query(queryText, params)
        return NextResponse.json(res.rows)
    } catch (error) {
        console.error('[KL-ERP] Library Books GET error:', error)
        return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 })
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
        const { title, author, isbn, category, total_copies, location } = body

        if (!title || !author || !total_copies) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const res = await query(
            `INSERT INTO library_books (title, author, isbn, category, total_copies, available_copies, location)
         VALUES ($1, $2, $3, $4, $5, $5, $6) RETURNING *`,
            [title, author, isbn, category, total_copies, location]
        )

        return NextResponse.json(res.rows[0], { status: 201 })
    } catch (error) {
        console.error('[KL-ERP] Library Books POST error:', error)
        return NextResponse.json({ error: 'Failed to add book' }, { status: 500 })
    }
}
