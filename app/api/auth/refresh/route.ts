import { NextRequest, NextResponse } from 'next/server'
import { rotateRefreshToken, signToken } from '@/lib/auth'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
    try {
        const refreshToken = request.cookies.get('refresh-token')?.value

        if (!refreshToken) {
            return NextResponse.json({ error: 'No refresh token' }, { status: 401 })
        }

        const result = await rotateRefreshToken(refreshToken)

        if (!result) {
            // Invalid or reused token
            const response = NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 })
            response.cookies.delete('auth-token')
            response.cookies.delete('refresh-token')
            return response
        }

        const { newToken, userId } = result

        // Get user role for new access token
        const userRes = await query('SELECT role FROM users WHERE id = $1', [userId])
        if (userRes.rowCount === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 401 })
        }
        const role = userRes.rows[0].role

        const newAccessToken = signToken({ id: userId, role })

        const response = NextResponse.json({ success: true })

        // Set new Access Token
        response.cookies.set('auth-token', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 15, // 15 minutes
            path: '/',
        })

        // Set new Refresh Token
        response.cookies.set('refresh-token', newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        })

        return response
    } catch (error) {
        console.error('[KL-ERP] Refresh error:', error)
        return NextResponse.json({ error: 'Refresh failed' }, { status: 500 })
    }
}
