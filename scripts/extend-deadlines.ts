
import 'dotenv/config'
import { query } from "../lib/db"

async function extendDeadlines() {
    try {
        const res = await query("UPDATE job_postings SET deadline_date = '2025-12-31' WHERE is_active = true")
        console.log(`Updated ${res.rowCount} jobs to expire on 2025-12-31`)

        // Verify
        const jobs = await query("SELECT title, deadline_date FROM job_postings")
        jobs.rows.forEach(j => {
            console.log(`Job: ${j.title}, New Deadline: ${j.deadline_date}`)
        })
    } catch (error) {
        console.error("Update failed:", error)
    }
}

extendDeadlines()
