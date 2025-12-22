
import 'dotenv/config'
import { query } from "../lib/db"

async function debugPlacements() {
    try {
        const jobs = await query("SELECT title, is_active, deadline_date, CURRENT_DATE as db_now FROM job_postings")
        console.log("DB Date:", jobs.rows.length > 0 ? jobs.rows[0].db_now : "N/A")
        jobs.rows.forEach(j => {
            console.log(`Job: ${j.title} | Active: ${j.is_active} | Deadline: ${j.deadline_date} | Visible? ${new Date(j.deadline_date) >= new Date(j.db_now)}`)
        })
    } catch (error) {
        console.error("Debug failed:", error)
    }
}

debugPlacements()
