
import 'dotenv/config'
import { query } from "../lib/db"

async function checkData() {
    try {
        const u = await query("SELECT COUNT(*) FROM users")
        const s = await query("SELECT COUNT(*) FROM students")
        const c = await query("SELECT COUNT(*) FROM courses")
        const d = await query("SELECT COUNT(*) FROM departments")

        console.log("Users:", u.rows[0].count)
        console.log("Students:", s.rows[0].count)
        console.log("Courses:", c.rows[0].count)
        console.log("Departments:", d.rows[0].count)

    } catch (error) {
        console.error("Check failed:", error)
    }
}

checkData()
