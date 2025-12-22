export { dynamic, fetchCache, revalidate } from "@/app/api/_config";
import { NextResponse, type NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const decoded: any = verifyToken(token.value)
        if (!decoded || decoded.role !== 'staff') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // 1. Open General Complaints
        const complaintsRes = await query(`SELECT COUNT(*) FROM general_complaints WHERE status = 'open'`)
        const openComplaints = parseInt(complaintsRes.rows[0].count)

        // 2. Open Infra Requests
        const infraRes = await query(`SELECT COUNT(*) FROM infrastructure_requests WHERE status = 'open' OR status = 'in_progress'`)
        const openInfra = parseInt(infraRes.rows[0].count)

        // 3. Inventory Low Stock
        const invRes = await query(`SELECT COUNT(*) FROM inventory_items WHERE quantity <= min_threshold`)
        const lowStock = parseInt(invRes.rows[0].count)

        // 4. Pending Tasks (Generic placeholder or logic)
        // Maybe tasks assigned to this user? `infrastructure_requests` where assigned_to = user_id
        const tasksRes = await query(`SELECT COUNT(*) FROM infrastructure_requests WHERE assigned_to = $1 AND status != 'closed'`, [decoded.id])
        const myTasks = parseInt(tasksRes.rows[0].count)

        return NextResponse.json({
            openComplaints,
            openInfra,
            lowStock,
            myTasks
        })

    } catch (error) {
        console.error('[KL-ERP] Staff Dashboard error:', error)
        return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
    }
}
