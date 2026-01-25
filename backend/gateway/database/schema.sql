-- Drop existing tables (for clean setup)
DROP TABLE IF EXISTS incident_requests CASCADE;
DROP TABLE IF EXISTS incidents CASCADE;
DROP TABLE IF EXISTS requests CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- USERS TABLE
CREATE TABLE users (
                       user_id VARCHAR(50) PRIMARY KEY,
                       username VARCHAR(100) NOT NULL UNIQUE,
                       email VARCHAR(255) NOT NULL UNIQUE,
                       password_hash VARCHAR(255) NOT NULL,
                       role VARCHAR(20) NOT NULL CHECK (role IN ('USER', 'ADMIN', 'SUPPORT', 'ENGINEER')),
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- REQUESTS (TICKETS) TABLE
CREATE TABLE requests (
                          request_id VARCHAR(50) PRIMARY KEY,
                          request_number VARCHAR(20) NOT NULL UNIQUE,
                          user_id VARCHAR(50) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
                          support_id VARCHAR(50) REFERENCES users(user_id) ON DELETE SET NULL,
                          category VARCHAR(50) NOT NULL CHECK (category IN ('plumbing', 'electrical', 'general')),
                          subject TEXT NOT NULL,
                          user_reported_priority VARCHAR(20) NOT NULL CHECK (user_reported_priority IN ('low', 'medium', 'high', 'urgent')),
                          status VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'rejected', 'in_service', 'done')),
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          created_by VARCHAR(50) NOT NULL,
                          updated_by VARCHAR(50)
);

-- Requests indexes for performance
CREATE INDEX idx_requests_user_id ON requests(user_id);
CREATE INDEX idx_requests_support_id ON requests(support_id);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_category ON requests(category);
CREATE INDEX idx_requests_priority ON requests(user_reported_priority);
CREATE INDEX idx_requests_created_at ON requests(created_at DESC);
CREATE INDEX idx_requests_user_status ON requests(user_id, status);

-- INCIDENTS TABLE
CREATE TABLE incidents (
                           incident_id VARCHAR(50) PRIMARY KEY,
                           incident_number VARCHAR(20) NOT NULL UNIQUE,
                           priority VARCHAR(10) NOT NULL CHECK (priority IN ('P1', 'P2', 'P3', 'P4')),
                           status VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
                           impact VARCHAR(50) NOT NULL,
                           urgency VARCHAR(50) NOT NULL,
                           category VARCHAR(100) NOT NULL,
                           description TEXT,
                           created_by VARCHAR(50) NOT NULL,
                           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                           updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                           updated_by VARCHAR(50)
);

-- Incidents indexes
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_priority ON incidents(priority);
CREATE INDEX idx_incidents_created_at ON incidents(created_at DESC);
CREATE INDEX idx_incidents_status_priority ON incidents(status, priority);

-- INCIDENT-REQUEST MAPPING TABLE
-- (Many-to-many: one incident can relate to multiple requests)
CREATE TABLE incident_requests (
                                   incident_id VARCHAR(50) NOT NULL REFERENCES incidents(incident_id) ON DELETE CASCADE,
                                   request_id VARCHAR(50) NOT NULL REFERENCES requests(request_id) ON DELETE CASCADE,
                                   linked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                   PRIMARY KEY (incident_id, request_id)
);

-- Mapping indexes
CREATE INDEX idx_incident_requests_incident ON incident_requests(incident_id);
CREATE INDEX idx_incident_requests_request ON incident_requests(request_id);

-- UPDATE TIMESTAMP TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to update updated_at automatically
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON incidents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- SEED DATA (for testing)

-- Insert test users (passwords are hashed version of 'password123')
-- /////////// In production, use bcrypt hashing from your application
INSERT INTO users (user_id, username, email, password_hash, role) VALUES
                                                                      ('user_001', 'john_user', 'user@test.org', '$2b$10$rBV2kUO3q5fQ4PZ.Qx7GH.MpQxBjZQXJY5YqXQxJp3Zq8YqXQxJp3', 'USER'),
                                                                      ('admin_001', 'admin_alice', 'admin@test.org', '$2b$10$rBV2kUO3q5fQ4PZ.Qx7GH.MpQxBjZQXJY5YqXQxJp3Zq8YqXQxJp3', 'ADMIN'),
                                                                      ('support_001', 'support_bob', 'support@test.org', '$2b$10$rBV2kUO3q5fQ4PZ.Qx7GH.MpQxBjZQXJY5YqXQxJp3Zq8YqXQxJp3', 'SUPPORT'),
                                                                      ('engineer_001', 'engineer_charlie', 'engineer@test.org', '$2b$10$rBV2kUO3q5fQ4PZ.Qx7GH.MpQxBjZQXJY5YqXQxJp3Zq8YqXQxJp3', 'ENGINEER');

-- Insert sample requests
INSERT INTO requests (request_id, request_number, user_id, category, subject, user_reported_priority, status, created_by) VALUES
                                                                                                                              ('req_001', 'REQ-001', 'user_001', 'plumbing', 'Leaking faucet in bathroom', 'medium', 'new', 'user_001'),
                                                                                                                              ('req_002', 'REQ-002', 'user_001', 'electrical', 'Light fixture not working', 'high', 'in_service', 'user_001'),
                                                                                                                              ('req_003', 'REQ-003', 'user_001', 'general', 'Broken door handle', 'low', 'done', 'user_001');

-- Insert sample incidents
INSERT INTO incidents (incident_id, incident_number, priority, status, impact, urgency, category, description, created_by) VALUES
                                                                                                                               ('inc_001', 'INC-001', 'P1', 'OPEN', 'high', 'critical', 'Network', 'Multiple users reporting connectivity issues', 'support_001'),
                                                                                                                               ('inc_002', 'INC-002', 'P2', 'IN_PROGRESS', 'medium', 'high', 'Hardware', 'Server performance degradation', 'support_001');

-- Link incidents to requests
INSERT INTO incident_requests (incident_id, request_id) VALUES
    ('inc_001', 'req_002');

-- VERIFICATION QUERIES

-- Count records in each table
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'requests', COUNT(*) FROM requests
UNION ALL
SELECT 'incidents', COUNT(*) FROM incidents
UNION ALL
SELECT 'incident_requests', COUNT(*) FROM incident_requests;

-- Display all tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Display all indexes
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM
    pg_indexes
WHERE
    schemaname = 'public'
ORDER BY
    tablename,
    indexname;

-- USEFUL QUERIES FOR DEVELOPMENT

-- Get all requests with user info
-- SELECT
--     r.request_id,
--     r.request_number,
--     r.subject,
--     r.status,
--     u.username,
--     u.email,
--     r.created_at
-- FROM requests r
-- JOIN users u ON r.user_id = u.user_id
-- ORDER BY r.created_at DESC;

-- Get all incidents with linked requests
-- SELECT
--     i.incident_id,
--     i.incident_number,
--     i.status,
--     i.priority,
--     COUNT(ir.request_id) as linked_requests
-- FROM incidents i
-- LEFT JOIN incident_requests ir ON i.incident_id = ir.incident_id
-- GROUP BY i.incident_id, i.incident_number, i.status, i.priority;

COMMENT ON TABLE users IS 'System users with role-based access';
COMMENT ON TABLE requests IS 'User-submitted service requests/tickets';
COMMENT ON TABLE incidents IS 'Incidents created from one or more requests';
COMMENT ON TABLE incident_requests IS 'Many-to-many mapping between incidents and requests';