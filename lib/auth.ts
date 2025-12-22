import jwt from 'jsonwebtoken'
import { headers } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'
import { query } from '@/lib/db'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'
const JWT_EXPIRES_IN = '15m' // Short lived access token
const REFRESH_TOKEN_EXPIRES_IN_DAYS = 7

export function signToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as any
  } catch (err) {
    return null
  }
}

export async function generateRefreshToken(userId: string) {
  const token = uuidv4()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_IN_DAYS)

  await query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [userId, token, expiresAt]
  )

  return token
}

export async function verifyRefreshToken(token: string) {
  const res = await query(
    'SELECT * FROM refresh_tokens WHERE token = $1 AND revoked_at IS NULL AND replaced_by_token IS NULL AND expires_at > NOW()',
    [token]
  )

  if (res.rowCount === 0) return null
  return res.rows[0]
}

export async function revokeRefreshToken(token: string, replacedByToken: string | null = null) {
  await query(
    'UPDATE refresh_tokens SET revoked_at = NOW(), replaced_by_token = $2 WHERE token = $1',
    [token, replacedByToken]
  )
}

export async function rotateRefreshToken(oldToken: string) {
  const tokenRecord = await verifyRefreshToken(oldToken)
  if (!tokenRecord) {
    // If token is invalid, check if it was reused (revoked or replaced)
    // Security: If a reused token is detected, we should revoke all tokens for that user (descendant revocation)
    // For now, just return null
    return null
  }

  const newToken = await generateRefreshToken(tokenRecord.user_id)
  await revokeRefreshToken(oldToken, newToken)

  return { newToken, userId: tokenRecord.user_id }
}

export async function getCurrentUser() {
  const headersList = await headers()
  const role = headersList.get('x-user-role')
  const id = headersList.get('x-user-id')

  if (!role || !id) return null

  return { role, id }
}

export async function requireAuth(allowedRoles?: string[]) {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw new Error('Forbidden')
  }

  return user
}
