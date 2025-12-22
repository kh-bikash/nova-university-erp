-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'faculty', 'student', 'parent', 'staff');
CREATE TYPE gender AS ENUM ('male', 'female', 'other');
CREATE TYPE hostel_room_type AS ENUM ('single', 'double', 'triple');
CREATE TYPE hostel_allocation_status AS ENUM ('allocated', 'waitlist', 'rejected');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'leave', 'late');
CREATE TYPE leave_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE fee_status AS ENUM ('pending', 'partial', 'paid', 'overdue');

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  role user_role NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Students table
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  enrollment_number VARCHAR(50) UNIQUE NOT NULL,
  date_of_birth DATE,
  gender gender,
  blood_group VARCHAR(10),
  address TEXT,
  father_name VARCHAR(255),
  father_contact VARCHAR(20),
  mother_name VARCHAR(255),
  mother_contact VARCHAR(20),
  emergency_contact VARCHAR(20),
  emergency_contact_name VARCHAR(255),
  department_id UUID,
  semester INT DEFAULT 1,
  cgpa DECIMAL(3, 2) DEFAULT 0,
  enrollment_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Faculty table
CREATE TABLE faculty (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  department_id UUID,
  specialization VARCHAR(255),
  date_of_joining DATE NOT NULL,
  qualification VARCHAR(255),
  experience_years INT,
  office_location VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Departments table
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  head_faculty_id UUID REFERENCES faculty(id),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses table
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_code VARCHAR(50) UNIQUE NOT NULL,
  course_name VARCHAR(255) NOT NULL,
  department_id UUID NOT NULL REFERENCES departments(id),
  credits INT NOT NULL,
  semester INT NOT NULL,
  description TEXT,
  faculty_id UUID REFERENCES faculty(id),
  max_students INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Course Enrollment table
CREATE TABLE course_enrollment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id),
  academic_year VARCHAR(10) NOT NULL,
  grade VARCHAR(2),
  marks DECIMAL(5, 2),
  enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, course_id, academic_year)
);

-- Timetable table
CREATE TABLE timetable (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id),
  day_of_week VARCHAR(10) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room_number VARCHAR(50),
  academic_year VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance table
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id),
  attendance_date DATE NOT NULL,
  status attendance_status NOT NULL,
  remarks TEXT,
  marked_by UUID REFERENCES faculty(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, course_id, attendance_date)
);

-- Grades/Marksheet table
CREATE TABLE grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id),
  academic_year VARCHAR(10) NOT NULL,
  internal_marks DECIMAL(5, 2),
  external_marks DECIMAL(5, 2),
  total_marks DECIMAL(5, 2),
  grade_point DECIMAL(2, 1),
  letter_grade VARCHAR(2),
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, course_id, academic_year)
);

-- Leave Requests table
CREATE TABLE leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  leave_type VARCHAR(50) NOT NULL,
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  reason TEXT,
  status leave_status DEFAULT 'pending',
  approved_by UUID REFERENCES faculty(id),
  approval_date TIMESTAMP,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fees table
CREATE TABLE fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  academic_year VARCHAR(10) NOT NULL,
  tuition_fee DECIMAL(10, 2),
  hostel_fee DECIMAL(10, 2),
  lab_fee DECIMAL(10, 2),
  exam_fee DECIMAL(10, 2),
  other_fee DECIMAL(10, 2),
  total_fee DECIMAL(10, 2),
  paid_amount DECIMAL(10, 2) DEFAULT 0,
  balance DECIMAL(10, 2),
  status fee_status DEFAULT 'pending',
  due_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fee Payments table
CREATE TABLE fee_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fee_id UUID NOT NULL REFERENCES fees(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  payment_method VARCHAR(50),
  transaction_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hostels table
CREATE TABLE hostels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  gender_type gender,
  total_rooms INT NOT NULL,
  capacity_per_room INT NOT NULL,
  warden_faculty_id UUID REFERENCES faculty(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hostel Rooms table
CREATE TABLE hostel_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id UUID NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
  room_number VARCHAR(50) NOT NULL,
  room_type hostel_room_type NOT NULL,
  capacity INT NOT NULL,
  current_occupancy INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'available',
  UNIQUE(hostel_id, room_number)
);

-- Hostel Allocations table
CREATE TABLE hostel_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES hostel_rooms(id),
  academic_year VARCHAR(10) NOT NULL,
  allocation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  checkout_date TIMESTAMP,
  status hostel_allocation_status DEFAULT 'allocated',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hostel Complaints table
CREATE TABLE hostel_complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  hostel_id UUID NOT NULL REFERENCES hostels(id),
  complaint_type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'open',
  resolution TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP
);

-- Extra Services table
CREATE TABLE extra_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name VARCHAR(255) NOT NULL,
  description TEXT,
  cost DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student Services Subscriptions table
CREATE TABLE student_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES extra_services(id),
  academic_year VARCHAR(10) NOT NULL,
  subscription_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'active',
  UNIQUE(student_id, service_id, academic_year)
);

-- Admin Logs table
CREATE TABLE admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id VARCHAR(100),
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_department_id ON students(department_id);
CREATE INDEX idx_students_enrollment_number ON students(enrollment_number);
CREATE INDEX idx_faculty_user_id ON faculty(user_id);
CREATE INDEX idx_faculty_department_id ON faculty(department_id);
CREATE INDEX idx_courses_department_id ON courses(department_id);
CREATE INDEX idx_courses_faculty_id ON courses(faculty_id);
CREATE INDEX idx_enrollment_student_id ON course_enrollment(student_id);
CREATE INDEX idx_enrollment_course_id ON course_enrollment(course_id);
CREATE INDEX idx_attendance_student_id ON attendance(student_id);
CREATE INDEX idx_attendance_date ON attendance(attendance_date);
CREATE INDEX idx_grades_student_id ON grades(student_id);
CREATE INDEX idx_grades_course_id ON grades(course_id);
CREATE INDEX idx_fees_student_id ON fees(student_id);
CREATE INDEX idx_hostel_allocations_student_id ON hostel_allocations(student_id);
CREATE INDEX idx_leave_requests_student_id ON leave_requests(student_id);
