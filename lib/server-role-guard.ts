export type UserRole = 'admin' | 'faculty' | 'student' | 'parent' | 'staff'

// Centralized permission map
// Key: Role, Value: List of allowed route prefixes
export const rolePermissions: Record<UserRole, string[]> = {
  admin: [
    '/admin',
    '/dashboard',
    '/api/admin',
    '/api/auth',
    '/api/upload',
    // API Routes
    '/api/attendance',
    '/api/courses',
    '/api/departments',
    '/api/enrollment',
    '/api/exams',
    '/api/faculty',
    '/api/fees',
    '/api/hostel',
    '/api/infrastructure',
    '/api/library',
    '/api/placement',
    '/api/placements',
    '/api/services',
    '/api/students',
    '/api/timetable',
    '/api/transport',
    '/api/users',
    '/api/settings',
    // Pages
    '/students',
    '/faculty',
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
    '/timetable',
    '/attendance',
    '/library',
    '/transport',
    '/placement',
    '/feedback',
    '/infrastructure',
    '/registrar',
    '/services',
    '/clubs',
    '/counselling',
    '/no-due',
    '/results',
    '/settings',
  ],
  faculty: [
    '/faculty',
    '/dashboard',
    '/api/faculty',
    '/api/auth',
    '/api/upload',
    // API Routes
    '/api/attendance',
    '/api/courses',
    '/api/exams',
    '/api/students',
    '/api/timetable',
    '/api/library',
    '/api/transport',
    '/api/hostel',
    '/api/leave-management',
    '/api/settings',
    // Pages
    '/attendance',
    '/grades',
    '/courses',
    '/students', // View students in their courses
    '/timetable',
    '/exams',
    '/notifications',
    '/events',
    '/leave-management', // Apply for leave
    '/documents',
    '/library',
    '/research',
    '/settings',
    '/transport',
    '/infrastructure',
    '/student/registrar', // Accessing the registrar page
  ],
  student: [
    '/student',
    '/dashboard',
    '/api/student',
    '/api/auth',
    '/api/upload',
    // API Routes
    '/api/attendance',
    '/api/courses',
    '/api/enrollment',
    '/api/exams',
    '/api/fees',
    '/api/hostel',
    '/api/library',
    '/api/placement',
    '/api/placements',
    '/api/timetable',
    '/api/transport',
    '/api/results',
    '/api/feedback',
    '/api/settings',
    // Pages
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
    '/api/parent',
    '/api/auth',
    // API Routes
    '/api/attendance',
    '/api/fees',
    '/api/exams',
    '/api/students',
    '/api/settings',
    // Pages
    '/students', // View their child's details
    '/grades',
    '/marksheet',
    '/fees',
    '/payments',
    '/notifications',
    '/transcripts',
    '/attendance',
    '/timetable',
    '/events',
    '/settings',
  ],
  staff: [
    '/staff',
    '/dashboard',
    '/api/staff',
    '/api/auth',
    // API Routes
    '/api/hostel',
    '/api/transport',
    '/api/infrastructure',
    '/api/library',
    '/api/inventory', // New
    '/api/complaints', // New
    '/api/students', // Needed for allocation lists
    '/api/upload',
    '/api/settings',
    // Pages
    '/hostel',
    '/events',
    '/notifications',
    '/leave-management',
    '/transport',
    '/infrastructure',
    '/library',
    '/settings',
  ],
}

export function canAccessPath(role: string | undefined, pathname: string): boolean {
  if (!role) return false
  const r = role as UserRole
  const allowed = rolePermissions[r] || []

  // Public API paths that might be caught by middleware if not careful, 
  // but generally middleware should exclude public paths before calling this.
  // However, for safety, we can explicitly allow some common shared paths if needed here.

  return allowed.some((p) => {
    // Exact match
    if (pathname === p) return true
    // Sub-path match (e.g. /admin/users matches /admin)
    if (pathname.startsWith(p + '/')) return true
    return false
  })
}

export function getRoleHomeRoute(role: string | undefined): string {
  switch (role) {
    case 'admin':
      return '/admin/dashboard'
    case 'faculty':
      return '/faculty/dashboard'
    case 'student':
      return '/student/dashboard'
    case 'parent':
      return '/parent/dashboard' // Or parent specific dashboard if exists
    case 'staff':
      return '/staff/dashboard' // Or staff specific dashboard if exists
    default:
      return '/login'
  }
}
