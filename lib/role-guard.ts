import { User } from '@/lib/auth-context'

export type UserRole = 'admin' | 'faculty' | 'student' | 'parent' | 'staff'

export const rolePermissions: Record<UserRole, string[]> = {
  admin: [
    '/admin',
    '/dashboard',
    '/students',
    '/courses',
    '/notifications',
    '/events',
    '/hostel',
    '/fees',
    '/payments',
    '/leave-management',
    '/documents',
    '/transcripts',
    '/exams',
    '/settings',
  ],
  faculty: [
    '/dashboard',
    '/faculty/dashboard',
    '/faculty/attendance-marking',
    '/attendance',
    '/faculty/grading',
    '/courses',
    '/students',
    '/settings',
    '/timetable',
    '/library',
    '/transport',
    '/infrastructure',
    '/student/registrar',
    '/faculty/exams',
  ],
  student: [
    '/student',
    '/dashboard',
    '/courses',
    '/course-registration',
    '/timetable',
    '/attendance',
    '/grades',
    '/marksheet',
    '/fees',
    '/payments',
    '/leave-management',
    '/documents',
    '/transcripts',
    '/hostel',
    '/notifications',
    '/events',
    '/exams',
    '/library',
    '/transport',
    '/clubs',
    '/counselling',
    '/feedback',
    '/results',
    '/settings',
    '/no-due',
  ],
  parent: [
    '/parent',
    '/dashboard',
    '/students',
    '/grades',
    '/marksheet',
    '/fees',
    '/payments',
    '/notifications',
    '/transcripts',
    '/settings',
  ],
  staff: [
    '/staff',
    '/dashboard',
    '/hostel',
    '/events',
    '/notifications',
    '/settings',
  ],
}

export function canAccessPage(user: User | null, pathname: string): boolean {
  if (!user) return false

  const allowedRoutes = rolePermissions[user.role as UserRole] || []
  return allowedRoutes.some((route) => pathname.startsWith(route))
}

export function getRoleHomeRoute(role: UserRole): string {
  switch (role) {
    case 'admin':
      return '/admin/dashboard'
    case 'faculty':
      return '/faculty/dashboard'
    case 'parent':
      return '/parent/dashboard'
    case 'staff':
      return '/staff/dashboard'
    default:
      return '/dashboard'
  }
}
