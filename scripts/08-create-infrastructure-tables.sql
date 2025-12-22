-- Infrastructure Assets table
CREATE TABLE IF NOT EXISTS infrastructure_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL, -- e.g., "Projector", "AC", "Room 101"
  type VARCHAR(100) NOT NULL, -- equipment, room, furniture
  location VARCHAR(255), -- e.g., "Block A, 1st Floor"
  purchase_date DATE,
  warranty_expiry DATE,
  status VARCHAR(50) DEFAULT 'active', -- active, under_maintenance, retired
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Maintenance Tickets table
CREATE TABLE IF NOT EXISTS maintenance_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES infrastructure_assets(id) ON DELETE SET NULL,
  reported_by UUID NOT NULL REFERENCES users(id), -- Faculty or Staff
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(50) DEFAULT 'medium', -- low, medium, high, critical
  status VARCHAR(50) DEFAULT 'open', -- open, in_progress, resolved, closed
  assigned_to VARCHAR(255), -- Name of maintenance staff/vendor
  resolution_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_maintenance_tickets_asset_id ON maintenance_tickets(asset_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_tickets_status ON maintenance_tickets(status);
CREATE INDEX IF NOT EXISTS idx_infrastructure_assets_type ON infrastructure_assets(type);
