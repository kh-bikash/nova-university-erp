import 'dotenv/config'
import { query } from "../lib/db"
import fs from "fs" // Use fs.promises if needed, but standard fs with readFileSync is fine for scripts
import { join } from "path"

async function runMigration() {
    try {
        console.log("Running System Settings migration...")

        const sqlPath = join(process.cwd(), "scripts", "13-create-system-settings.sql")
        const sql = fs.readFileSync(sqlPath, "utf8")

        await query(sql)

        console.log("System Settings migration completed successfully")
    } catch (error) {
        console.error("Migration failed:", error)
        process.exit(1)
    }
}

runMigration()
