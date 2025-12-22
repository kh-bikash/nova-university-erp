export { dynamic, fetchCache, revalidate } from "@/app/api/_config";
import { NextResponse, type NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const decoded: any = verifyToken(token.value)
        if (!decoded || decoded.role !== 'student') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Get student ID
        const sRes = await query('SELECT id FROM students WHERE user_id = $1', [decoded.id])
        if (sRes.rowCount === 0) return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })
        const studentId = sRes.rows[0].id

        // 1. Enrolled Courses Count
        const coursesRes = await query('SELECT COUNT(*) FROM course_enrollment WHERE student_id = $1', [studentId])
        const enrolledCourses = parseInt(coursesRes.rows[0].count)

        // 2. Attendance Percentage (Overall)
        const attRes = await query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present
            FROM attendance 
            WHERE student_id = $1
        `, [studentId])
        const totalClasses = parseInt(attRes.rows[0].total) || 0
        const presentClasses = parseInt(attRes.rows[0].present) || 0
        const attendancePercentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0

        // 3. CGPA (Mock logic or real if available)
        // For now, let's calculate average from exam results if CGPA column doesn't exist or is complex
        const resultsRes = await query(`
            SELECT er.marks_obtained, e.max_marks 
            FROM exam_results er
            JOIN exams e ON er.exam_id = e.id
            WHERE er.student_id = $1
        `, [studentId])
        let cgpa = 0
        if ((resultsRes.rowCount ?? 0) > 0) {
            const totalPercentage = resultsRes.rows.reduce((acc, curr) => acc + (curr.marks_obtained / curr.max_marks) * 100, 0) / (resultsRes.rowCount ?? 1)
            cgpa = parseFloat((totalPercentage / 9.5).toFixed(2)) // Approximate conversion
        }

        // 4. Pending Fees
        const feesRes = await query(`
            SELECT COUNT(*) as count 
            FROM fees 
            WHERE student_id = $1 AND status IN ('pending', 'partial', 'overdue')
        `, [studentId])
        const pendingFees = parseInt(feesRes.rows[0].count) || 0

        // 5. Hostel Status
        const hostelRes = await query(`
            SELECT status, room_id 
            FROM hostel_allocations 
            WHERE student_id = $1 AND status = 'allocated'
            LIMIT 1
        `, [studentId])
        const hostelStatus = (hostelRes.rowCount ?? 0) > 0 ? 'Allocated' : 'Not Allocated'

        // 6. Attendance Trend (Last 5 Months)
        const trendRes = await query(`
            SELECT TO_CHAR(attendance_date, 'Mon') as month, 
                   COUNT(*) as total,
                   SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present
            FROM attendance
            WHERE student_id = $1 AND attendance_date >= NOW() - INTERVAL '5 months'
            GROUP BY TO_CHAR(attendance_date, 'Mon'), EXTRACT(MONTH FROM attendance_date)
            ORDER BY EXTRACT(MONTH FROM attendance_date)
        `, [studentId])

        const attendanceTrend = trendRes.rows.map(row => ({
            month: row.month,
            attendance: parseInt(row.total) > 0 ? Math.round((parseInt(row.present) / parseInt(row.total)) * 100) : 0
        }))

        // 7. GPA Progress (Real calculation)
        const gpaRes = await query(`
            SELECT academic_year as name, AVG(grade_point)::numeric(3,2) as gpa
            FROM grades
            WHERE student_id = $1
            GROUP BY academic_year
            ORDER BY academic_year
        `, [studentId])

        const gpaData = (gpaRes.rowCount ?? 0) > 0 ? gpaRes.rows.map(r => ({ ...r, gpa: Number(r.gpa) })) : []

        // 8. Upcoming Exams
        const examsRes = await query(`
            SELECT e.exam_name as subject, e.exam_date, e.start_time as time
            FROM exams e
            JOIN course_enrollment ce ON e.course_id = ce.course_id
            WHERE ce.student_id = $1 AND e.exam_date >= CURRENT_DATE
            ORDER BY e.exam_date ASC
            LIMIT 3
        `, [studentId])
        const upcomingExams = examsRes.rows.map(e => ({
            subject: e.subject,
            date: new Date(e.exam_date).toLocaleDateString(),
            time: e.time
        }))

        // 9. Recent Grades
        const gradesRes = await query(`
            SELECT c.course_name as subject, er.marks_obtained as score, er.remarks
            FROM exam_results er
            JOIN exams e ON er.exam_id = e.id
            JOIN courses c ON e.course_id = c.id
            WHERE er.student_id = $1
            ORDER BY er.updated_at DESC
            LIMIT 3
        `, [studentId])
        const recentGrades = gradesRes.rows.map(g => ({
            subject: g.subject,
            score: g.score,
            grade: g.score >= 90 ? 'A+' : g.score >= 80 ? 'A' : 'B'
        }))

        return NextResponse.json({
            success: true,
            data: {
                enrolledCourses,
                attendancePercentage,
                currentGPA: cgpa,
                pendingFees,
                hostelStatus,
                attendanceTrend,
                gpaData,
                upcomingExams,
                recentGrades
            }
        })

    } catch (error) {
        console.error('[KL-ERP] Student Dashboard GET error:', error)
        return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
    }
}
