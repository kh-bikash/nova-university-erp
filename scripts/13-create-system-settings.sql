CREATE TABLE IF NOT EXISTS system_settings (
  key VARCHAR(50) PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings if they don't exist
INSERT INTO system_settings (key, value, description)
VALUES 
  ('current_academic_year', '2023-2024', 'Current Academic Year'),
  ('current_semester', '1', 'Current Semester (1-8)'),
  ('registration_open', 'true', 'Is course registration open?'),
  ('university_name', 'Nova University', 'Name of the University'),
  ('contact_email', 'admin@kl.edu.in', 'System Contact Email')
ON CONFLICT (key) DO NOTHING;
