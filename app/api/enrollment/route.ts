import { NextResponse, type NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('student_id');
  const token = req.cookies.get('auth-token')
  let resolvedStudentId = studentId

  if (!resolvedStudentId && token) {
    const decoded: any = verifyToken(token.value)
    if (decoded && decoded.role === 'student') {
      const sRes = await query('SELECT id FROM students WHERE user_id = $1', [decoded.id])
      if (sRes.rowCount && sRes.rowCount > 0) resolvedStudentId = sRes.rows[0].id
    }
  }

  if (!resolvedStudentId) {
    return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
  }

  try {
    // Get enrolled courses for the student
    const result = await query(
      `SELECT c.id, c.course_code as code, c.course_name as name, c.credits, 
              u.full_name as faculty, ce.enrollment_date
       FROM course_enrollment ce
       JOIN courses c ON ce.course_id = c.id
       LEFT JOIN faculty f ON c.faculty_id = f.id
       LEFT JOIN users u ON f.user_id = u.id
       WHERE ce.student_id = $1`,
      [resolvedStudentId]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch enrollments:', error);
    return NextResponse.json({ error: 'Failed to fetch enrollments' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { student_id, course_id } = await req.json();
    console.log('[KL-ERP] Enrollment POST:', { student_id, course_id })

    if (!student_id || !course_id) {
      return NextResponse.json({ error: 'Student ID and Course ID are required' }, { status: 400 });
    }

    // Check if already enrolled
    const existing = await query(
      'SELECT id FROM course_enrollment WHERE student_id = $1 AND course_id = $2',
      [student_id, course_id]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Already enrolled in this course' }, { status: 400 });
    }

    // Check capacity
    const course = await query('SELECT max_students FROM courses WHERE id = $1', [course_id]);
    if (course.rows.length === 0) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const enrolledCount = await query('SELECT COUNT(*) FROM course_enrollment WHERE course_id = $1', [course_id]);
    if (parseInt(enrolledCount.rows[0].count) >= course.rows[0].max_students) {
      return NextResponse.json({ error: 'Course is full' }, { status: 400 });
    }

    // Enroll
    const enrolled = await query(
      `INSERT INTO course_enrollment (student_id, course_id, academic_year, enrollment_date)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [student_id, course_id, '2024-2025']
    );

    // Fetch details for frontend
    const details = await query(
      `SELECT c.id, c.course_code as code, c.course_name as name, c.credits, 
                u.full_name as faculty, ce.enrollment_date
         FROM course_enrollment ce
         JOIN courses c ON ce.course_id = c.id
         LEFT JOIN faculty f ON c.faculty_id = f.id
         LEFT JOIN users u ON f.user_id = u.id
         WHERE ce.id = $1`,
      [enrolled.rows[0].id]
    )

    return NextResponse.json({ success: true, course: details.rows[0] });
  } catch (error: any) {
    console.error('Failed to enroll:', error);
    return NextResponse.json({ error: `Failed to enroll: ${error.message}` }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('student_id');
  const courseId = searchParams.get('course_id');

  if (!studentId || !courseId) {
    return NextResponse.json({ error: 'Student ID and Course ID are required' }, { status: 400 });
  }

  try {
    await query(
      'DELETE FROM course_enrollment WHERE student_id = $1 AND course_id = $2',
      [studentId, courseId]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to unenroll:', error);
    return NextResponse.json({ error: 'Failed to unenroll' }, { status: 500 });
  }
}
