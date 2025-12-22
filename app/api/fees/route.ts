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
        const studentId = searchParams.get('student_id')
        const status = searchParams.get('status')

        let queryText = `
      SELECT 
        f.id,
        f.student_id,
        s.enrollment_number,
        u.full_name as student_name,
        f.academic_year,
        f.tuition_fee,
        f.hostel_fee,
        f.lab_fee,
        f.exam_fee,
        f.other_fee,
        f.total_fee,
        f.paid_amount,
        f.balance,
        f.status,
        f.due_date
      FROM fees f
      JOIN students s ON f.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE 1=1
    `
        const params: any[] = []
        let paramCount = 1

        // Role-based filtering
        if (decoded.role === 'student') {
            // Students can only see their own fees
            // We need to resolve student_id from user_id if not provided or verify it matches
            const sRes = await query('SELECT id FROM students WHERE user_id = $1', [decoded.id])
            if (sRes.rowCount === 0) return NextResponse.json([]) // No student profile found

            queryText += ` AND f.student_id = $${paramCount}`
            params.push(sRes.rows[0].id)
            paramCount++
        } else if (studentId) {
            // Admin/Faculty filtering by specific student
            queryText += ` AND f.student_id = $${paramCount}`
            params.push(studentId)
            paramCount++
        }

        if (status) {
            queryText += ` AND f.status = $${paramCount}`
            params.push(status)
            paramCount++
        }

        queryText += ` ORDER BY f.created_at DESC`

        const res = await query(queryText, params)
        return NextResponse.json(res.rows)
    } catch (error) {
        console.error('[KL-ERP] Fees GET error:', error)
        return NextResponse.json({ error: 'Failed to fetch fees' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const decoded: any = verifyToken(token.value)
        // Only admin can assign fees
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const body = await request.json()
        const {
            student_id,
            academic_year,
            tuition_fee = 0,
            hostel_fee = 0,
            lab_fee = 0,
            exam_fee = 0,
            other_fee = 0,
            due_date
        } = body

        if (!student_id || !academic_year || !due_date) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const total_fee = Number(tuition_fee) + Number(hostel_fee) + Number(lab_fee) + Number(exam_fee) + Number(other_fee)
        const balance = total_fee // Initial balance is total fee

        const res = await query(
            `INSERT INTO fees (
        student_id, academic_year, tuition_fee, hostel_fee, lab_fee, exam_fee, other_fee, total_fee, balance, due_date, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending') RETURNING *`,
            [student_id, academic_year, tuition_fee, hostel_fee, lab_fee, exam_fee, other_fee, total_fee, balance, due_date]
        )

        return NextResponse.json(res.rows[0], { status: 201 })
    } catch (error) {
        console.error('[KL-ERP] Fees POST error:', error)
        return NextResponse.json({ error: 'Failed to assign fee' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const decoded: any = verifyToken(token.value)
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await request.json()
        const { fee_id, amount, payment_method = 'online' } = body

        if (!fee_id || !amount) {
            return NextResponse.json({ error: 'Fee ID and Amount required' }, { status: 400 })
        }

        // 1. Get current fee details
        const feeRes = await query('SELECT * FROM fees WHERE id = $1', [fee_id])
        if (feeRes.rowCount === 0) {
            return NextResponse.json({ error: 'Fee record not found' }, { status: 404 })
        }
        const fee = feeRes.rows[0]

        // 2. Verify ownership if student
        if (decoded.role === 'student') {
            const sRes = await query('SELECT id FROM students WHERE user_id = $1', [decoded.id])
            if (sRes.rowCount === 0 || sRes.rows[0].id !== fee.student_id) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
            }
        }

        // 3. Record Payment
        await query(
            `INSERT INTO fee_payments (fee_id, amount, payment_method, transaction_id)
           VALUES ($1, $2, $3, $4)`,
            [fee_id, amount, payment_method, `TXN_${Date.now()}`]
        )

        // 4. Update Fee Balance
        const newPaidAmount = Number(fee.paid_amount) + Number(amount)
        const newBalance = Number(fee.total_fee) - newPaidAmount
        let newStatus = 'partial'
        if (newBalance <= 0) newStatus = 'paid'
        else if (newPaidAmount === 0) newStatus = 'pending' // Should not happen here but logic wise

        const updateRes = await query(
            `UPDATE fees SET paid_amount = $1, balance = $2, status = $3, updated_at = NOW() 
           WHERE id = $4 RETURNING *`,
            [newPaidAmount, newBalance, newStatus, fee_id]
        )

        return NextResponse.json(updateRes.rows[0])
    } catch (error) {
        console.error('[KL-ERP] Fees Payment error:', error)
        return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 })
    }
}
