import fs from "fs"
import path from "path"
import dotenv from "dotenv"

// Load env first
dotenv.config({ path: '.env.local' })
dotenv.config()

async function run() {
    try {
        // Dynamic import to ensure env vars are loaded
        const { query } = await import("../lib/db")

        const sqlPath = path.join(process.cwd(), "scripts", "15-add-avatar-url.sql")
        const sql = fs.readFileSync(sqlPath, "utf8")
        console.log("Running SQL...")
        await query(sql)
        console.log("Migration successful")
        process.exit(0)
    } catch (e: any) {
        console.error("Migration failed:")
        console.error(e.message)
        process.exit(1)
    }
}

run()
