-- 1. Insert Transport Routes
INSERT INTO transport_routes (route_number, route_name, vehicle_number, driver_name, driver_contact) VALUES
('R-1', 'City Center - Campus', 'KA-01-AB-1234', 'Ramesh Kumar', '9876543210'),
('R-2', 'Whitefield - Campus', 'KA-03-CD-5678', 'Suresh Reddy', '9876543211'),
('R-6', 'Gandhinagar - Campus', 'KA-05-EF-9012', 'Mahesh Babu', '9876543212')
ON CONFLICT (route_number) DO NOTHING;

-- 2. Insert Transport Stops (Using CTEs or internal linking if IDs were known, but safer to select)
-- For R-1
INSERT INTO transport_stops (route_id, stop_name, pickup_time, fee_amount) VALUES
((SELECT id FROM transport_routes WHERE route_number = 'R-1'), 'City Center Mall', '07:30:00', 15000.00),
((SELECT id FROM transport_routes WHERE route_number = 'R-1'), 'Central Bus Stand', '07:45:00', 12000.00),
((SELECT id FROM transport_routes WHERE route_number = 'R-1'), 'Town Hall', '08:00:00', 10000.00);

-- For R-2
INSERT INTO transport_stops (route_id, stop_name, pickup_time, fee_amount) VALUES
((SELECT id FROM transport_routes WHERE route_number = 'R-2'), 'Whitefield Main Road', '07:15:00', 18000.00),
((SELECT id FROM transport_routes WHERE route_number = 'R-2'), 'ITPL Gate', '07:30:00', 16000.00),
((SELECT id FROM transport_routes WHERE route_number = 'R-2'), 'Hope Farm', '07:45:00', 14000.00);

-- For R-6
INSERT INTO transport_stops (route_id, stop_name, pickup_time, fee_amount) VALUES
((SELECT id FROM transport_routes WHERE route_number = 'R-6'), 'Gandhinagar Main Circle', '07:40:00', 13000.00),
((SELECT id FROM transport_routes WHERE route_number = 'R-6'), 'Jairaj Street', '08:00:00', 11000.00);
