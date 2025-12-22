-- Add faculty_id to timetable
ALTER TABLE timetable 
ADD COLUMN faculty_id UUID REFERENCES faculty(id);

CREATE INDEX idx_timetable_faculty_id ON timetable(faculty_id);
