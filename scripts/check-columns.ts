import dotenv from "dotenv"
dotenv.config({ path: '.env.local' })
dotenv.config()

async function run() {
    try {
        const { query } = await import("../lib/db")
        const res = await query(`
       SELECT column_name 
       FROM information_schema.columns 
       WHERE table_name = 'users'
     `)
        const cols = res.rows.map(r => r.column_name)
        console.log("Columns:", cols)
        console.log("Has avatar_url:", cols.includes('avatar_url'))
        process.exit(0)
    } catch (e) {
        console.error(e)
        process.exit(1)
    }
}
run()
