export { dynamic, fetchCache, revalidate } from "@/app/api/_config";
import { NextResponse, type NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const decoded: any = verifyToken(token.value)
        if (!decoded || decoded.role !== 'parent') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // 1. Get Parent ID
        const parentRes = await query('SELECT id FROM parents WHERE user_id = $1', [decoded.id])
        if (parentRes.rowCount === 0) {
            // If parent record doesn't exist, create one? Or return empty.
            // For now, return empty or create generic?
            // Let's assume registration created it, but since I just migrated, I might need to auto-create if missing for existing users.
            // But I can't easily. I'll return specific error or empty.
            return NextResponse.json({ children: [] })
        }
        const parentId = parentRes.rows[0].id

        // 2. Get Children
        const childrenRes = await query(`
            SELECT s.id, s.enrollment_number, u.full_name as name, s.department_id, d.code as dept_code, s.semester, s.cgpa
            FROM students s
            JOIN parent_students ps ON s.id = ps.student_id
            JOIN users u ON s.user_id = u.id
            LEFT JOIN departments d ON s.department_id = d.id
            WHERE ps.parent_id = $1
        `, [parentId])

        const children = childrenRes.rows

        // 3. Get Stats for each child
        const childrenWithStats = await Promise.all(children.map(async (child) => {
            // Attendance
            const attRes = await query(`
                SELECT 
                    COUNT(*) as total_classes,
                    COUNT(CASE WHEN status = 'present' THEN 1 END) as present_classes
                FROM attendance
                WHERE student_id = $1
             `, [child.id])
            const totalClasses = parseInt(attRes.rows[0].total_classes) || 0
            const presentClasses = parseInt(attRes.rows[0].present_classes) || 0
            const attendance = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0

            // Fees
            const feeRes = await query(`
                SELECT SUM(balance) as pending_fees
                FROM fees
                WHERE student_id = $1 AND status != 'paid'
             `, [child.id])
            const pendingFees = feeRes.rows[0].pending_fees || 0

            return {
                ...child,
                stats: {
                    attendance,
                    pendingFees,
                    cgpa: child.cgpa || 0
                }
            }
        }))

        return NextResponse.json({ children: childrenWithStats })

    } catch (error) {
        console.error('[KL-ERP] Parent Dashboard error:', error)
        return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
    }
}
