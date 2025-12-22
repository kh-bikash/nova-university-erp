-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- e.g., 'resume', 'transcript', 'id_proof'
  file_url TEXT NOT NULL,
  file_type VARCHAR(50), -- mime type
  file_size INT, -- in bytes
  status VARCHAR(50) DEFAULT 'pending', -- pending, verified, rejected
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  verified_at TIMESTAMP,
  verified_by UUID REFERENCES users(id)
);

CREATE INDEX idx_documents_user_id ON documents(user_id);
