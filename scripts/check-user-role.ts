
import 'dotenv/config'
import { query } from "../lib/db"

async function checkUserRole() {
    try {
        const res = await query("SELECT id, email, full_name, role FROM users")
        console.log(`Found ${res.rowCount} users.`)
        res.rows.forEach(u => {
            console.log(`User: ${u.full_name} (${u.email}) - Role: '${u.role}'`)
        })
    } catch (error) {
        console.error("Check failed:", error)
    }
}

checkUserRole()
