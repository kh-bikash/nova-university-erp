import { query } from '../lib/db'
import dotenv from 'dotenv'
dotenv.config()

async function runMigration() {
    try {
        console.log('Creating staff feature tables...')

        await query(`
            -- Infrastructure Requests
            CREATE TABLE IF NOT EXISTS infrastructure_requests (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                title VARCHAR(255) NOT NULL,
                description TEXT,
                location VARCHAR(100),
                priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
                status VARCHAR(50) DEFAULT 'open', -- open, in_progress, resolved, closed
                requester_id UUID REFERENCES users(id),
                assigned_to UUID REFERENCES users(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- General Complaints (University wide)
            CREATE TABLE IF NOT EXISTS general_complaints (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                category VARCHAR(100), -- Academic, Facility, Harassment, etc
                subject VARCHAR(255),
                description TEXT,
                status VARCHAR(50) DEFAULT 'open',
                submitted_by UUID REFERENCES users(id),
                is_anonymous BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- Inventory
            CREATE TABLE IF NOT EXISTS inventory_items (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                item_name VARCHAR(255) NOT NULL,
                category VARCHAR(100),
                quantity INT DEFAULT 0,
                unit VARCHAR(20), -- pcs, kg, etc
                min_threshold INT DEFAULT 10,
                location VARCHAR(100),
                last_restocked DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- Transport (Basic)
            CREATE TABLE IF NOT EXISTS transport_vehicles (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                vehicle_number VARCHAR(50) UNIQUE NOT NULL,
                type VARCHAR(50), -- Bus, Van, Car
                capacity INT,
                driver_name VARCHAR(100),
                driver_contact VARCHAR(20),
                route_name VARCHAR(100),
                status VARCHAR(50) DEFAULT 'active', -- active, maintenance
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `)

        console.log('Staff schema migration completed.')
    } catch (error) {
        console.error('Migration failed:', error)
        process.exit(1)
    }
}

runMigration()
