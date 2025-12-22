import dotenv from "dotenv"
dotenv.config({ path: '.env.local' })
dotenv.config()

async function run() {
    try {
        const { query } = await import("../lib/db")

        // 1. Get a user
        const uRes = await query('SELECT id, email, full_name, avatar_url FROM users LIMIT 1')
        if (uRes.rowCount === 0) {
            console.log("No users found")
            process.exit(0)
        }
        const user = uRes.rows[0]
        console.log("Initial User:", user)

        // 2. Update avatar
        const newUrl = "/uploads/test-script-avatar.jpg"
        console.log("Updating to:", newUrl)
        const upRes = await query('UPDATE users SET avatar_url = $1 WHERE id = $2 RETURNING avatar_url', [newUrl, user.id])
        console.log("Update Returned:", upRes.rows[0])

        // 3. Verify
        const vRes = await query('SELECT avatar_url FROM users WHERE id = $1', [user.id])
        console.log("Verified User:", vRes.rows[0])

        process.exit(0)
    } catch (e) {
        console.error(e)
        process.exit(1)
    }
}
run()
