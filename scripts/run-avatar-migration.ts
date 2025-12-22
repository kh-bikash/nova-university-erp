
import 'dotenv/config'
import { query } from "../lib/db"
import fs from 'fs'
import path from 'path'

async function runMigration() {
    try {
        const sql = fs.readFileSync(path.join(__dirname, '14-add-avatar-to-users.sql'), 'utf8')
        await query(sql)
        console.log("Migration 14-add-avatar-to-users applied successfully.")
    } catch (error) {
        console.error("Migration failed:", error)
    }
}

runMigration()
