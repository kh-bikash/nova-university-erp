
import 'dotenv/config'
import { query } from "../lib/db"
import fs from "fs"
import { join } from "path"

async function runMigration() {
    try {
        console.log("Running Notifications migration...")

        const sqlPath = join(process.cwd(), "scripts", "02-create-notifications.sql")
        const sql = fs.readFileSync(sqlPath, "utf8")

        await query(sql)

        console.log("Notifications migration completed successfully")
    } catch (error) {
        console.error("Migration failed:", error)
        process.exit(1)
    }
}

runMigration()
