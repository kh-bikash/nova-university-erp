
import 'dotenv/config'
import { query } from "../lib/db"

async function debugPlacementsFull() {
    try {
        // 1. Check raw jobs
        const rawJobs = await query("SELECT id, company_id, title FROM job_postings WHERE is_active = true AND deadline_date >= CURRENT_DATE")
        console.log(`Raw Active Jobs (deadline >= CURRENT_DATE): ${rawJobs.rows.length}`)

        // 2. Check Companies
        if (rawJobs.rows.length > 0) {
            const companyId = rawJobs.rows[0].company_id
            const company = await query("SELECT id, name FROM companies WHERE id = $1", [companyId])
            console.log(`Company for first job exists? ${company.rowCount > 0}`)
            if (company.rowCount === 0) console.log(`CRITICAL: Job ${rawJobs.rows[0].id} points to missing company ${companyId}`)
        }

        // 3. Test exact API query (simulating no student ID filter on LEFT JOIN for now)
        const sql = `
        SELECT j.id, j.title, c.name as company_name
        FROM job_postings j
        JOIN companies c ON j.company_id = c.id
        WHERE j.is_active = true AND j.deadline_date >= CURRENT_DATE
    `
        const apiRes = await query(sql)
        console.log(`API Query Result Count: ${apiRes.rowCount}`)
        if (apiRes.rowCount > 0) {
            console.log("First API Result:", apiRes.rows[0])
        }

    } catch (error) {
        console.error("Debug failed:", error)
    }
}

debugPlacementsFull()
