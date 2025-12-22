-- Add semester column to timetable
ALTER TABLE timetable 
ADD COLUMN semester INT;

-- Optional: Add index for filtering by semester
CREATE INDEX idx_timetable_semester ON timetable(semester);
