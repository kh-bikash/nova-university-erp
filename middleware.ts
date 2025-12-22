// Middleware for RBAC
// Updated to ensure permissions are refreshed
import { NextResponse } from 'next/server'
// Middleware for RBAC
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { canAccessPath, getRoleHomeRoute } from './lib/server-role-guard'

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/signup',
  '/auth/login',
  '/auth/signup',
  '/api/auth', // Allow all auth routes initially, specific handlers will validate
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/refresh', // New refresh token route
  '/api/courses', // Publicly available course list
]

function isPublic(pathname: string) {
  if (pathname === '/') return true
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon.ico') || pathname.startsWith('/static') || pathname.startsWith('/public') || pathname.startsWith('/uploads')) return true

  // Check exact match or subpath for public paths
  for (const p of PUBLIC_PATHS) {
    if (pathname === p || pathname.startsWith(p + '/')) return true
  }
  return false
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('auth-token')?.value

  let user: { role: string; id: string } | null = null

  // 1. Try to verify token if present
  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-change-me')
      const { payload } = await jwtVerify(token, secret)
      user = {
        role: (payload as any).role as string,
        id: (payload as any).id as string
      }
    } catch (err) {
      // Token invalid/expired
      // If accessing a protected API route, return 401 immediately
      if (pathname.startsWith('/api/') && !isPublic(pathname)) {
        return NextResponse.json({ success: false, error: 'Invalid Token' }, { status: 401 })
      }
      // For other protected routes, we'll handle it in step 3 (redirect to login)
    }
  }

  // 2. Prepare headers if user is authenticated
  const requestHeaders = new Headers(req.headers)
  if (user) {
    requestHeaders.set('x-user-role', user.role)
    requestHeaders.set('x-user-id', user.id)
  }

  // 3. Check for public paths
  if (isPublic(pathname)) {
    // Even for public paths, we pass the auth headers if they exist
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  // 4. Enforce Auth for private paths
  if (!user) {
    // If accessing an API route without token, return 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    // Otherwise redirect to login
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }

  // 5. Check Role Permissions
  if (!canAccessPath(user.role, pathname)) {
    // If accessing an API route without permission, return 403
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    // Otherwise redirect to role's home
    const url = req.nextUrl.clone()
    url.pathname = getRoleHomeRoute(user.role)
    return NextResponse.redirect(url)
  }

  // 6. Allow access with headers
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  // run for all paths except static assets
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
}
