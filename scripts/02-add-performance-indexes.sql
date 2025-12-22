-- Add indexes for search and filtering performance

-- Users
CREATE INDEX IF NOT EXISTS idx_users_full_name ON users(full_name);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Students
-- Students
CREATE INDEX IF NOT EXISTS idx_students_semester ON students(semester);

-- Faculty
CREATE INDEX IF NOT EXISTS idx_faculty_specialization ON faculty(specialization);

-- Courses
CREATE INDEX IF NOT EXISTS idx_courses_course_name ON courses(course_name);
CREATE INDEX IF NOT EXISTS idx_courses_semester ON courses(semester);

-- Attendance
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance(status);
CREATE INDEX IF NOT EXISTS idx_attendance_composite ON attendance(course_id, attendance_date);

-- Fees
CREATE INDEX IF NOT EXISTS idx_fees_status ON fees(status);
CREATE INDEX IF NOT EXISTS idx_fees_academic_year ON fees(academic_year);
CREATE INDEX IF NOT EXISTS idx_fees_due_date ON fees(due_date);

-- Hostel
CREATE INDEX IF NOT EXISTS idx_hostel_allocations_status ON hostel_allocations(status);
CREATE INDEX IF NOT EXISTS idx_hostel_rooms_status ON hostel_rooms(status);
