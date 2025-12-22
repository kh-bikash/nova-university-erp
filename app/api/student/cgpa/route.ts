export { dynamic, fetchCache, revalidate } from "@/app/api/_config";
import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(request: Request) {
    try {
        const token = (await request.headers.get('cookie'))?.split('; ').find(row => row.startsWith('auth-token='))?.split('=')[1]
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const decoded: any = verifyToken(token)
        if (!decoded || decoded.role !== 'student') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Get student ID
        const studentRes = await query('SELECT id FROM students WHERE user_id = $1', [decoded.id])
        if ((studentRes.rowCount ?? 0) === 0) {
            return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })
        }
        const studentId = studentRes.rows[0].id

        // Fetch all exam results for the student
        // We need: course details (credits, semester), marks obtained, max marks
        const resultsQuery = `
            SELECT 
                c.course_code,
                c.course_name,
                c.credits,
                c.semester,
                er.marks_obtained,
                e.max_marks
            FROM exam_results er
            JOIN exams e ON er.exam_id = e.id
            JOIN courses c ON e.course_id = c.id
            WHERE er.student_id = $1 AND e.status = 'published'
        `
        const results = await query(resultsQuery, [studentId])

        // Process data to calculate SGPA and CGPA
        // Group by semester
        const semesterMap = new Map<number, {
            totalCredits: number,
            totalPoints: number,
            courses: any[]
        }>()

        // Helper to calculate grade points
        const calculateGradePoint = (obtained: number, max: number) => {
            const percentage = (obtained / max) * 100
            if (percentage >= 90) return 10
            if (percentage >= 80) return 9
            if (percentage >= 70) return 8
            if (percentage >= 60) return 7
            if (percentage >= 50) return 6
            if (percentage >= 40) return 5
            return 0 // Fail
        }

        const calculateGradeLetter = (obtained: number, max: number) => {
            const percentage = (obtained / max) * 100
            if (percentage >= 90) return 'O'
            if (percentage >= 80) return 'A+'
            if (percentage >= 70) return 'A'
            if (percentage >= 60) return 'B+'
            if (percentage >= 50) return 'B'
            if (percentage >= 40) return 'C'
            return 'F'
        }

        // We need to handle multiple exams per course (e.g. Mid1, Mid2, EndSem)
        // For simplicity in this iteration, let's assume the 'exam_results' row represents the final score for the course 
        // OR we aggregate them. 
        // Given the schema, it's individual exams. 
        // Let's assume for now we just take the latest or sum them? 
        // A proper system would have weightages. 
        // Let's group by course_code first to aggregate marks if there are multiple exams for one course.

        const courseMap = new Map<string, {
            code: string,
            name: string,
            credits: number,
            semester: number,
            totalObtained: number,
            totalMax: number
        }>()

        results.rows.forEach(row => {
            const key = row.course_code
            if (!courseMap.has(key)) {
                courseMap.set(key, {
                    code: row.course_code,
                    name: row.course_name,
                    credits: row.credits,
                    semester: row.semester,
                    totalObtained: 0,
                    totalMax: 0
                })
            }
            const course = courseMap.get(key)!
            course.totalObtained += Number(row.marks_obtained)
            course.totalMax += Number(row.max_marks)
        })

        // Now calculate GP and assign to semesters
        courseMap.forEach(course => {
            if (!semesterMap.has(course.semester)) {
                semesterMap.set(course.semester, { totalCredits: 0, totalPoints: 0, courses: [] })
            }
            const sem = semesterMap.get(course.semester)!

            const gradePoint = calculateGradePoint(course.totalObtained, course.totalMax)
            const gradeLetter = calculateGradeLetter(course.totalObtained, course.totalMax)

            sem.totalCredits += course.credits
            sem.totalPoints += (gradePoint * course.credits)

            sem.courses.push({
                code: course.code,
                name: course.name,
                grade: gradeLetter,
                points: gradePoint,
                credits: course.credits
            })
        })

        // Calculate SGPA for each semester
        const semesters: any[] = []
        let cumulativePoints = 0
        let cumulativeCredits = 0

        Array.from(semesterMap.entries())
            .sort((a, b) => a[0] - b[0])
            .forEach(([semNum, data]) => {
                const sgpa = data.totalCredits > 0 ? (data.totalPoints / data.totalCredits) : 0
                cumulativePoints += data.totalPoints
                cumulativeCredits += data.totalCredits

                semesters.push({
                    sem: semNum,
                    sgpa: Number(sgpa.toFixed(2)),
                    credits: data.totalCredits,
                    courses: data.courses
                })
            })

        const cgpa = cumulativeCredits > 0 ? (cumulativePoints / cumulativeCredits) : 0

        return NextResponse.json({
            cgpa: Number(cgpa.toFixed(2)),
            totalCredits: cumulativeCredits,
            semesters
        })

    } catch (error) {
        console.error('[KL-ERP] CGPA Calc error:', error)
        return NextResponse.json({ error: 'Failed to calculate CGPA' }, { status: 500 })
    }
}
