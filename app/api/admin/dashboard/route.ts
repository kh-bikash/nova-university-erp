import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { query } from '@/lib/db'
import { getCache, setCache } from '@/lib/cache'
import { apiResponse, handleApiError } from '@/lib/api-utils'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        await requireAuth(['admin'])

        const cacheKey = 'admin:dashboard:stats'
        const cachedData = await getCache(cacheKey)

        if (cachedData) {
            return apiResponse(cachedData)
        }

        // Parallelize queries for performance
        const [
            studentsRes,
            facultyRes,
            coursesRes,
            hostelRes,
            deptRes
        ] = await Promise.all([
            query('SELECT COUNT(*) as count FROM students'),
            query('SELECT COUNT(*) as count FROM faculty'),
            query('SELECT COUNT(*) as count FROM courses'),
            query(`
        SELECT 
          (SELECT COUNT(*) FROM hostel_rooms) as total_rooms,
          (SELECT SUM(capacity) FROM hostel_rooms) as total_capacity,
          (SELECT COUNT(*) FROM hostel_allocations WHERE status = 'allocated') as occupied
      `),
            query(`
        SELECT d.name, COUNT(s.id) as value
        FROM departments d
        LEFT JOIN students s ON d.id = s.department_id
        GROUP BY d.name
      `)
        ])

        const stats = {
            totalStudents: parseInt(studentsRes.rows[0].count),
            totalFaculty: parseInt(facultyRes.rows[0].count),
            totalCourses: parseInt(coursesRes.rows[0].count),
            hostelOccupancy: parseInt(hostelRes.rows[0].occupied || '0'),
            hostelCapacity: parseInt(hostelRes.rows[0].total_capacity || '0'),
            departmentStats: deptRes.rows.map(row => ({
                name: row.name,
                value: parseInt(row.value)
            })),
            // Mocking trend data for now as we might not have historical data
            enrollmentTrend: [
                { semester: "Sem 1", students: 2450, courses: 32 },
                { semester: "Sem 2", students: 2480, courses: 32 },
                { semester: "Sem 3", students: 2510, courses: 32 },
                { semester: "Sem 4", students: 2545, courses: 32 },
            ],
            averageAttendance: 88.5, // Placeholder, requires complex query
            averageGPA: 3.6, // Placeholder
        }

        // Cache for 5 minutes
        await setCache(cacheKey, stats, 300)

        return apiResponse(stats)
    } catch (error) {
        return handleApiError(error)
    }
}
