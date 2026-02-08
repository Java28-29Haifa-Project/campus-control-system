gBEGIN;
ALTER TABLE incidents DROP CONSTRAINT IF EXISTS incidents_priority_check;
ALTER TABLE incidents DROP CONSTRAINT IF EXISTS incidents_status_check;

ALTER TABLE incidents
ALTER COLUMN priority TYPE INTEGER USING (
    CASE
      WHEN priority = 'P1' OR priority = '1' THEN 1
      WHEN priority = 'P2' OR priority = '2' THEN 2
      WHEN priority = 'P3' OR priority = '3' THEN 3
      WHEN priority = 'P4' OR priority = '4' THEN 4
      ELSE 3  -- Default to P3 if invalid
    END
  );

ALTER TABLE incidents
    ADD CONSTRAINT incidents_priority_check
        CHECK (priority >= 1 AND priority <= 4);

ALTER TABLE incidents
    ALTER COLUMN priority SET DEFAULT 3;

UPDATE incidents
SET status = CASE
                 WHEN UPPER(status) = 'OPEN' THEN 'new'
                 WHEN UPPER(status) = 'IN_PROGRESS' OR UPPER(status) = 'INPROGRESS' THEN 'in_progress'
                 WHEN UPPER(status) = 'RESOLVED' THEN 'resolved'
                 WHEN UPPER(status) = 'CLOSED' THEN 'closed'
                 WHEN LOWER(status) IN ('new', 'assigned', 'in_progress', 'resolved', 'closed') THEN LOWER(status)
                 ELSE 'new'  -- Default to 'new' if invalid
    END;

ALTER TABLE incidents
    ADD CONSTRAINT incidents_status_check
        CHECK (status IN ('new', 'assigned', 'in_progress', 'resolved', 'closed'));

ALTER TABLE incidents
    ALTER COLUMN status SET DEFAULT 'new';

SELECT
    column_name,
    data_type,
    character_maximum_length,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'incidents'
  AND column_name IN ('priority', 'status')
ORDER BY column_name;

SELECT
    conname AS constraint_name,
    pg_get_constraintdef(c.oid) AS constraint_definition
FROM pg_constraint c
         JOIN pg_namespace n ON n.oid = c.connamespace
WHERE conrelid = 'incidents'::regclass
  AND conname LIKE '%priority%' OR conname LIKE '%status%'
ORDER BY conname;

SELECT
    incident_id,
    incident_number,
    priority,
    status,
    category,
    created_at
FROM incidents
ORDER BY created_at DESC
    LIMIT 5;

COMMIT;
