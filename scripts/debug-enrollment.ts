
import 'dotenv/config'
import { query } from "../lib/db"

async function debugEnrollment() {
    try {
        const ce = await query("SELECT * FROM course_enrollment")
        console.log("Enrollments:", ce.rows.length)
        if (ce.rows.length > 0) console.log(ce.rows[0])

        // Check if any student has 0 enrollments
        const students = await query("SELECT id FROM students")
        for (const s of students.rows) {
            const count = await query("SELECT COUNT(*) FROM course_enrollment WHERE student_id = $1", [s.id])
            console.log(`Student ${s.id} has ${count.rows[0].count} enrollments`)
        }

    } catch (error) {
        console.error("Debug failed:", error)
    }
}

debugEnrollment()
