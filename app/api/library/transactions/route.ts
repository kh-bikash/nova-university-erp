import { NextResponse, type NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const decoded: any = verifyToken(token.value)
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        let queryText = `
            SELECT lt.*, lb.title, lb.author, u.full_name as student_name, s.enrollment_number
            FROM library_transactions lt
            JOIN library_books lb ON lt.book_id = lb.id
            JOIN students s ON lt.student_id = s.id
            JOIN users u ON s.user_id = u.id
            WHERE 1=1
        `
        const params: any[] = []

        if (decoded.role === 'student') {
            const sRes = await query('SELECT id FROM students WHERE user_id = $1', [decoded.id])
            if (sRes.rowCount === 0) return NextResponse.json([])

            queryText += ` AND lt.student_id = $1`
            params.push(sRes.rows[0].id)
        }

        queryText += ` ORDER BY lt.issue_date DESC`

        const res = await query(queryText, params)
        return NextResponse.json(res.rows)

    } catch (error) {
        console.error('[KL-ERP] Library Transactions GET error:', error)
        return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
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
        const { type, book_id, student_id, transaction_id } = body // type: 'issue' or 'return'

        if (type === 'issue') {
            if (!book_id || !student_id) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

            // Check availability
            const bookRes = await query('SELECT available_copies FROM library_books WHERE id = $1', [book_id])
            if (bookRes.rowCount === 0) return NextResponse.json({ error: 'Book not found' }, { status: 404 })
            if (bookRes.rows[0].available_copies <= 0) return NextResponse.json({ error: 'Book not available' }, { status: 400 })

            // Issue book
            const dueDate = new Date()
            dueDate.setDate(dueDate.getDate() + 14) // 2 weeks due

            const res = await query(
                `INSERT INTO library_transactions (book_id, student_id, due_date, status)
                 VALUES ($1, $2, $3, 'issued') RETURNING *`,
                [book_id, student_id, dueDate]
            )

            // Update copies
            await query('UPDATE library_books SET available_copies = available_copies - 1 WHERE id = $1', [book_id])

            return NextResponse.json(res.rows[0], { status: 201 })

        } else if (type === 'return') {
            if (!transaction_id) return NextResponse.json({ error: 'Transaction ID required' }, { status: 400 })

            // Get transaction
            const txRes = await query('SELECT * FROM library_transactions WHERE id = $1', [transaction_id])
            if (txRes.rowCount === 0) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
            const tx = txRes.rows[0]

            if (tx.status === 'returned') return NextResponse.json({ error: 'Already returned' }, { status: 400 })

            // Calculate fine (mock logic)
            const today = new Date()
            const due = new Date(tx.due_date)
            let fine = 0
            if (today > due) {
                const diffTime = Math.abs(today.getTime() - due.getTime())
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                fine = diffDays * 10 // 10 Rs per day
            }

            // Return book
            const res = await query(
                `UPDATE library_transactions 
                 SET return_date = CURRENT_DATE, status = 'returned', fine_amount = $1, updated_at = NOW()
                 WHERE id = $2 RETURNING *`,
                [fine, transaction_id]
            )

            // Update copies
            await query('UPDATE library_books SET available_copies = available_copies + 1 WHERE id = $1', [tx.book_id])

            return NextResponse.json(res.rows[0])
        }

        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })

    } catch (error) {
        console.error('[KL-ERP] Library Transaction POST error:', error)
        return NextResponse.json({ error: 'Failed to process transaction' }, { status: 500 })
    }
}
