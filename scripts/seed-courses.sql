-- 1. Insert Departments
INSERT INTO departments (name, code) VALUES
('Computer Science & Engineering', 'CSE'),
('Electronics & Communication', 'ECE'),
('Mechanical Engineering', 'ME'),
('Business Administration', 'MBA')
ON CONFLICT (code) DO NOTHING;

-- 2. Insert Courses
-- Note: We use subqueries to get department IDs dynamically based on code
INSERT INTO courses (course_code, course_name, credits, semester, department_id, max_students) VALUES
('CS101', 'Introduction to Programming', 4, 1, (SELECT id FROM departments WHERE code = 'CSE'), 60),
('CS102', 'Data Structures', 4, 2, (SELECT id FROM departments WHERE code = 'CSE'), 60),
('CS201', 'Database Management Systems', 3, 3, (SELECT id FROM departments WHERE code = 'CSE'), 60),
('CS202', 'Operating Systems', 3, 4, (SELECT id FROM departments WHERE code = 'CSE'), 60),
('EC101', 'Digital Electronics', 4, 1, (SELECT id FROM departments WHERE code = 'ECE'), 60),
('MB101', 'Management Principles', 3, 1, (SELECT id FROM departments WHERE code = 'MBA'), 60)
ON CONFLICT (course_code) DO NOTHING;
