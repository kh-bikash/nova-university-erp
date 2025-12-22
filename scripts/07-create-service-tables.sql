-- Service Requests table
CREATE TABLE IF NOT EXISTS service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  service_type VARCHAR(100) NOT NULL, -- bonafide, transfer_certificate, id_card
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, processing, completed
  admin_remarks TEXT,
  request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_service_requests_student_id ON service_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
