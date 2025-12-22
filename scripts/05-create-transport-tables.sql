-- Transport Routes table
CREATE TABLE IF NOT EXISTS transport_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_number VARCHAR(50) UNIQUE NOT NULL,
  route_name VARCHAR(255) NOT NULL, -- e.g., "Route 1 - City Center"
  driver_name VARCHAR(255),
  driver_contact VARCHAR(20),
  vehicle_number VARCHAR(50),
  capacity INT NOT NULL DEFAULT 40,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transport Stops table
CREATE TABLE IF NOT EXISTS transport_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES transport_routes(id) ON DELETE CASCADE,
  stop_name VARCHAR(255) NOT NULL,
  pickup_time TIME NOT NULL,
  drop_time TIME,
  fee_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student Transport Subscription table
CREATE TABLE IF NOT EXISTS student_transport (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  route_id UUID NOT NULL REFERENCES transport_routes(id),
  stop_id UUID NOT NULL REFERENCES transport_stops(id),
  academic_year VARCHAR(10) NOT NULL,
  status VARCHAR(50) DEFAULT 'active', -- active, cancelled
  subscription_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, academic_year)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_transport_stops_route_id ON transport_stops(route_id);
CREATE INDEX IF NOT EXISTS idx_student_transport_student_id ON student_transport(student_id);
CREATE INDEX IF NOT EXISTS idx_student_transport_route_id ON student_transport(route_id);
