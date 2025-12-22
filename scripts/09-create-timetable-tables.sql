CREATE TABLE IF NOT EXISTS timetables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id),
  faculty_id UUID REFERENCES faculty(id),
  day_of_week VARCHAR(10) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room_number VARCHAR(20),
  semester INTEGER NOT NULL,
  section VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_timetables_course_id ON timetables(course_id);
CREATE INDEX IF NOT EXISTS idx_timetables_faculty_id ON timetables(faculty_id);
CREATE INDEX IF NOT EXISTS idx_timetables_day_of_week ON timetables(day_of_week);
CREATE INDEX IF NOT EXISTS idx_timetables_semester ON timetables(semester);
