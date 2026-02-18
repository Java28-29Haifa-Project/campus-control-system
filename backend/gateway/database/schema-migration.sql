-- 01-02-2026

ALTER TABLE requests
DROP CONSTRAINT IF EXISTS requests_category_check;

ALTER TABLE requests
    ADD CONSTRAINT requests_category_check
        CHECK (category IN (
                            'plumbing',
                            'electrical',
                            'hvac',
                            'gas',
                            'fire_safety',
                            'elevators',
                            'access',
                            'network',
                            'infrastructure',
                            'other',
                            'system'
            ));

ALTER TABLE requests
    ALTER COLUMN description DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_requests_created_at_filter
    ON requests(created_at DESC, status);

CREATE INDEX IF NOT EXISTS idx_requests_user_status_created
    ON requests(user_id, status, created_at DESC);

SELECT COUNT(*) as total_requests FROM requests;

ALTER TABLE incidents
    ADD COLUMN IF NOT EXISTS assigned_by VARCHAR(50),
    ADD COLUMN IF NOT EXISTS resolved_by VARCHAR(50);

ALTER TABLE incidents
    ADD COLUMN priority_new INTEGER;

UPDATE incidents
SET priority_new = CASE priority
                       WHEN 'P1' THEN 1
                       WHEN 'P2' THEN 2
                       WHEN 'P3' THEN 3
                       WHEN 'P4' THEN 4
                       ELSE 4  -- Default to lowest priority if unknown
    END;

ALTER TABLE incidents
DROP COLUMN priority;

ALTER TABLE incidents
    RENAME COLUMN priority_new TO priority;

ALTER TABLE incidents
    ADD CONSTRAINT incidents_priority_check
        CHECK (priority >= 1 AND priority <= 4);

ALTER TABLE incidents
    ALTER COLUMN priority SET NOT NULL,
ALTER COLUMN priority SET DEFAULT 4;

UPDATE incidents
SET status = CASE status
                 WHEN 'OPEN' THEN 'new'
                 WHEN 'ASSIGNED' THEN 'assigned'
                 WHEN 'IN_PROGRESS' THEN 'in_progress'
                 WHEN 'RESOLVED' THEN 'resolved'
                 WHEN 'CLOSED' THEN 'closed'
                 ELSE 'new'
    END;

ALTER TABLE incidents
DROP CONSTRAINT IF EXISTS incidents_status_check;

ALTER TABLE incidents
    ADD CONSTRAINT incidents_status_check
        CHECK (status IN ('new', 'assigned', 'in_progress', 'resolved', 'closed'));

ALTER TABLE incidents
    ALTER COLUMN status SET DEFAULT 'new';

ALTER TABLE incidents
DROP COLUMN IF EXISTS incident_number;

ALTER TABLE incidents
DROP COLUMN IF EXISTS impact,
  DROP COLUMN IF EXISTS urgency;

DROP INDEX IF EXISTS idx_incidents_status_priority;
CREATE INDEX idx_incidents_status_priority
    ON incidents(status, priority);

CREATE INDEX IF NOT EXISTS idx_incidents_assigned_by
    ON incidents(assigned_by)
    WHERE assigned_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_incidents_created_at_filter
    ON incidents(created_at DESC, status, priority);

SELECT COUNT(*) as total_incidents FROM incidents;

SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'requests'
ORDER BY ordinal_position;

SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'incidents'
ORDER BY ordinal_position;

SELECT
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid IN ('requests'::regclass, 'incidents'::regclass)
ORDER BY conrelid, contype;

SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('requests', 'incidents')
ORDER BY tablename, indexname;


INSERT INTO requests (request_id, request_number, user_id, category, subject, description, user_reported_priority, status, created_by) VALUES
                                                                                                                                           ('req_new_001', 'REQ-20260131-0001', 'user_001', 'network', 'Wi-Fi not working in office', 'Cannot connect to wi-fi access point in building A', 'high', 'new', 'user_001'),
                                                                                                                                           ('req_new_002', 'REQ-20260131-0002', 'user_001', 'hvac', 'Air conditioning too cold', 'Temperature too low in conference room', 'medium', 'new', 'user_001'),
                                                                                                                                           ('req_new_003', 'REQ-20260131-0003', 'user_001', 'elevators', 'Elevator stuck on 3rd floor', NULL, 'urgent', 'new', 'user_001'),
                                                                                                                                           ('req_new_004', 'REQ-20260131-0004', 'user_001', 'access', 'Door lock not working', 'Emergency exit door lock broken', 'high', 'in_service', 'user_001')
    ON CONFLICT (request_id) DO NOTHING;

INSERT INTO incidents (incident_id, priority, status, category, description, created_by, assigned_by) VALUES
                                                                                                          ('inc_new_001', 1, 'in_progress', 'network', 'Multiple users reporting wi-fi issues in building A', 'support_001', 'engineer_001'),
                                                                                                          ('inc_new_002', 2, 'assigned', 'elevators', 'Elevator maintenance required', 'support_001', 'engineer_001'),
                                                                                                          ('inc_new_003', 3, 'new', 'hvac', 'Temperature regulation issues', 'support_001', NULL)
    ON CONFLICT (incident_id) DO NOTHING;

INSERT INTO incident_requests (incident_id, request_id) VALUES
                                                            ('inc_new_001', 'req_new_001'),
                                                            ('inc_new_002', 'req_new_003'),
                                                            ('inc_new_003', 'req_new_002')
    ON CONFLICT (incident_id, request_id) DO NOTHING;


SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'requests', COUNT(*) FROM requests
UNION ALL
SELECT 'incidents', COUNT(*) FROM incidents
UNION ALL
SELECT 'incident_requests', COUNT(*) FROM incident_requests
ORDER BY table_name;

SELECT
    request_id,
    category,
    subject,
    user_reported_priority,
    status,
    description IS NULL as is_description_null
FROM requests
ORDER BY created_at DESC
    LIMIT 5;

SELECT
    incident_id,
    priority,
    status,
    category,
    assigned_by,
    resolved_by
FROM incidents
ORDER BY created_at DESC
    LIMIT 5;
