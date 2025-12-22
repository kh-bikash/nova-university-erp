
import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth, getCurrentUser } from '@/lib/auth'
import { apiResponse, handleApiError } from '@/lib/api-utils'

// Force dynamic since we read DB
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const session = await getCurrentUser()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id: userId, role } = session

        // Fetch notifications for:
        // 1. Specific user (recipient_id = userId)
        // 2. Specific role (recipient_role = role OR null) AND recipient_id IS NULL
        // AND we want to check if they are "read" but our table doesn't have a read_notifications join table yet.
        // For simplicity in this step, we will assume all extracted notifications are "unread" or we just list them.
        // Real implementation usually needs a user_notifications table to track read status per user for broadcasts.
        // However, the prompt asks for "real data", so let's stick to the existing schema or enhance it.
        // The current schema doesn't support "read" status for broadcasts effectively without a separate table.
        // But let's look at the frontend mock: it expects `read: boolean`.

        // Quick fix: Add a `is_read` column to `notifications` but that only works for direct messages.
        // For broadcasts, we can't track read status easily without a join table.
        // Let's assume for now we just show the last 20 notifications.

        const res = await query(`
      SELECT * 
      FROM notifications 
      WHERE 
        recipient_id = $1 
        OR (recipient_id IS NULL AND (recipient_role = $2 OR recipient_role IS NULL))
      ORDER BY created_at DESC 
      LIMIT 20
    `, [userId, role])

        // Improve typing and transformation
        const data = res.rows.map(n => ({
            id: n.id,
            title: n.title,
            message: n.message,
            type: n.type || 'info', // Default to info if null
            timestamp: n.created_at,
            read: false // Default to false as we don't track it properly yet
        }))

        return apiResponse(data)
    } catch (error) {
        return handleApiError(error)
    }
}
