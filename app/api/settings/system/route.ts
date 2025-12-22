
import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { apiResponse, handleApiError, apiError } from '@/lib/api-utils'

// Force dynamic since we read DB
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        // Check if user is authenticated (any role can read basics, but maybe we restrict sensitive ones?)
        // For now, let's allow read access to authenticated users as these are "System Settings" which usually drive UI
        await requireAuth(['admin', 'faculty', 'student'])

        const res = await query('SELECT key, value, description FROM system_settings')

        // Transform array to object for easier consumption { key: value }
        const settings = res.rows.reduce((acc, curr) => {
            acc[curr.key] = curr.value
            return acc
        }, {} as Record<string, string>)

        return apiResponse(settings)
    } catch (error) {
        return handleApiError(error)
    }
}

export async function PUT(request: NextRequest) {
    try {
        // Only Admin can update settings
        await requireAuth(['admin'])

        const body = await request.json()
        const { settings } = body // Expecting { settings: { key: value, key2: value2 } }

        if (!settings || typeof settings !== 'object') {
            return apiError('Invalid settings format', 400)
        }

        // Begin transaction
        await query('BEGIN')

        const updates = []
        for (const [key, value] of Object.entries(settings)) {
            // Upsert: Update if exists, Insert if not
            updates.push(query(
                `INSERT INTO system_settings (key, value) 
         VALUES ($1, $2) 
         ON CONFLICT (key) 
         DO UPDATE SET value = $2, updated_at = NOW()`,
                [key, String(value)]
            ))
        }

        await Promise.all(updates)
        await query('COMMIT')

        return apiResponse({ success: true, message: 'Settings updated successfully' })
    } catch (error) {
        await query('ROLLBACK')
        return handleApiError(error)
    }
}
