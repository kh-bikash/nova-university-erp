import { query } from '../lib/db'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config()

async function verifyDB() {
    let output = 'Verifying Database Content...\n'

    try {
        // Connection Info
        const client = await query('SELECT current_database(), current_user, inet_server_addr(), inet_server_port()')
        output += `\nConnected to: ${JSON.stringify(client.rows[0])}\n`

        // List Tables
        const tables = await query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
        output += `\nTables: ${tables.rows.map(t => t.table_name).join(', ')}\n`

        // Check Courses
        const courses = await query('SELECT * FROM courses')
        output += `\nCourses Found: ${courses.rowCount}\n`
        courses.rows.forEach(c => {
            output += ` - [${c.id}] ${c.course_code}: ${c.course_name} (Dept: ${c.department_id})\n`
        })

        // Check Departments
        const depts = await query('SELECT * FROM departments')
        output += `\nDepartments Found: ${depts.rowCount}\n`
        depts.rows.forEach(d => {
            output += ` - [${d.id}] ${d.name}\n`
        })

        fs.writeFileSync('db-check.txt', output)
        console.log('Output written to db-check.txt')

    } catch (error) {
        console.error('Verification failed:', error)
        fs.writeFileSync('db-check.txt', `Error: ${error}`)
    } finally {
        process.exit(0)
    }
}

verifyDB()
