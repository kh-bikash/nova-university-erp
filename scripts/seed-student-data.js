const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function seedData() {
    try {
        console.log('Seeding data...');

        // 1. Get a student
        const sRes = await pool.query('SELECT id, user_id FROM students LIMIT 1');
        if (sRes.rowCount === 0) {
            console.log('No students found. Please create a student first.');
            return;
        }
        const studentId = sRes.rows[0].id;
        console.log('Seeding for student:', studentId);

        // 2. Seed Fees
        const feesCheck = await pool.query('SELECT id FROM fees WHERE student_id = $1', [studentId]);
        if (feesCheck.rowCount === 0) {
            await pool.query(`
            INSERT INTO fees (student_id, academic_year, tuition_fee, hostel_fee, lab_fee, exam_fee, other_fee, total_fee, paid_amount, balance, status, due_date)
            VALUES 
            ($1, '2024-2025', 50000, 20000, 5000, 2000, 1000, 78000, 0, 78000, 'pending', '2024-12-31')
        `, [studentId]);
            console.log('Seeded Fees');
        }

        // 3. Seed Library Books
        const booksCheck = await pool.query('SELECT id FROM library_books LIMIT 1');
        if (booksCheck.rowCount === 0) {
            await pool.query(`
            INSERT INTO library_books (title, author, isbn, category, total_copies, available_copies, location)
            VALUES 
            ('Introduction to Algorithms', 'Cormen', '9780262033848', 'Computer Science', 10, 8, 'A1-101'),
            ('Clean Code', 'Robert C. Martin', '9780132350884', 'Software Engineering', 5, 5, 'B2-202'),
            ('Database System Concepts', 'Silberschatz', '9780073523323', 'Databases', 8, 7, 'C3-303')
        `);
            console.log('Seeded Library Books');
        }

        // 4. Seed Library Transactions
        const txCheck = await pool.query('SELECT id FROM library_transactions WHERE student_id = $1', [studentId]);
        if (txCheck.rowCount === 0) {
            const bookRes = await pool.query('SELECT id FROM library_books LIMIT 1');
            if (bookRes.rowCount > 0) {
                const bookId = bookRes.rows[0].id;
                await pool.query(`
                INSERT INTO library_transactions (book_id, student_id, issue_date, due_date, status)
                VALUES ($1, $2, NOW(), NOW() + INTERVAL '14 days', 'issued')
            `, [bookId, studentId]);
                console.log('Seeded Library Transaction');
            }
        }

        // 5. Seed Exams
        const examsCheck = await pool.query('SELECT id FROM exams LIMIT 1');
        if (examsCheck.rowCount === 0) {
            // Get a course
            const courseRes = await pool.query('SELECT id FROM courses LIMIT 1');
            if (courseRes.rowCount > 0) {
                const courseId = courseRes.rows[0].id;
                await pool.query(`
                INSERT INTO exams (course_id, exam_name, exam_date, start_time, end_time, max_marks, status)
                VALUES 
                ($1, 'Mid-Term Exam', '2024-12-15', '10:00', '12:00', 50, 'scheduled'),
                ($1, 'Final Exam', '2025-01-20', '14:00', '17:00', 100, 'scheduled')
            `, [courseId]);
                console.log('Seeded Exams');
            }
        }

        console.log('Seeding complete.');

    } catch (error) {
        console.error('Seeding error:', error);
    } finally {
        await pool.end();
    }
}

seedData();
