BEGIN;

ALTER TABLE incidents DROP CONSTRAINT IF EXISTS incidents_status_check;
ALTER TABLE incidents ADD CONSTRAINT incidents_status_check
    CHECK (status IN ('new', 'assigned', 'in_progress', 'resolved', 'closed'));

ALTER TABLE requests DROP CONSTRAINT IF EXISTS requests_status_check;
ALTER TABLE requests ADD CONSTRAINT requests_status_check
    CHECK (status IN ('rejected', 'in_service', 'new', 'done'));

ALTER TABLE incidents
    ADD COLUMN IF NOT EXISTS close_requested_at TIMESTAMP NULL,
    ADD COLUMN IF NOT EXISTS close_requested_by VARCHAR(50) NULL,
    ADD COLUMN IF NOT EXISTS closed_at TIMESTAMP NULL;

ALTER TABLE requests
    ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP NULL;

CREATE INDEX IF NOT EXISTS idx_incidents_close_requested
    ON incidents(status, close_requested_at)
    WHERE status = 'resolved' AND close_requested_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_incidents_closed
    ON incidents(status, closed_at)
    WHERE status = 'closed';

CREATE INDEX IF NOT EXISTS idx_requests_completed
    ON requests(status, completed_at)
    WHERE status = 'done';

COMMENT ON COLUMN incidents.close_requested_at IS
'Timestamp when admin requested to close this incident. Status remains "resolved" until auto-close.';

COMMENT ON COLUMN incidents.close_requested_by IS
'User ID who requested closure';

COMMENT ON COLUMN incidents.closed_at IS
'Timestamp when incident was actually closed (auto or manual)';

COMMENT ON COLUMN requests.completed_at IS
'Timestamp when request was marked as done';

SELECT
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid IN ('incidents'::regclass, 'requests'::regclass)
  AND contype = 'c'
ORDER BY conrelid::regclass::text, conname;

SELECT
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('incidents', 'requests')
  AND column_name IN ('close_requested_at', 'close_requested_by', 'closed_at', 'completed_at')
ORDER BY table_name, ordinal_position;

COMMIT;

/*
BEGIN;

INSERT INTO incidents (
    incident_id,
    incident_number,
    priority,
    status,
    category,
    created_by
)
VALUES (
    'test-close-001',
    'INC-TEST-CLOSE-001',
    1,
    'resolved',  -- Status stays resolved!
    'network',
    'admin_001'
);

UPDATE incidents
SET
    close_requested_at = CURRENT_TIMESTAMP,
    close_requested_by = 'admin_001'
WHERE incident_id = 'test-close-001';

SELECT
    incident_id,
    status,  -- Should be "resolved"
    close_requested_at,  -- Should have timestamp
    close_requested_by,
    closed_at  -- Should be NULL
FROM incidents
WHERE incident_id = 'test-close-001';

UPDATE incidents
SET
    status = 'closed',
    closed_at = CURRENT_TIMESTAMP
WHERE incident_id = 'test-close-001'
  AND status = 'resolved'  -- Only close if still resolved
  AND close_requested_at IS NOT NULL;  -- Only close if close was requested

SELECT * FROM incidents WHERE incident_id = 'test-close-001';

DELETE FROM incidents WHERE incident_id = 'test-close-001';

COMMIT;


--rb
BEGIN;

DROP INDEX IF EXISTS idx_incidents_close_requested;
DROP INDEX IF EXISTS idx_incidents_closed;
DROP INDEX IF EXISTS idx_requests_completed;

ALTER TABLE incidents
DROP COLUMN IF EXISTS close_requested_at,
DROP COLUMN IF EXISTS close_requested_by,
DROP COLUMN IF EXISTS closed_at;

ALTER TABLE requests
DROP COLUMN IF EXISTS completed_at;

ALTER TABLE incidents DROP CONSTRAINT IF EXISTS incidents_status_check;
ALTER TABLE incidents ADD CONSTRAINT incidents_status_check
CHECK (status IN ('new', 'assigned', 'in_progress', 'resolved'));

COMMIT;
*/