BEGIN;

ALTER TABLE incident_requests
DROP CONSTRAINT IF EXISTS incident_requests_incident_id_fkey;

ALTER TABLE incident_comments
DROP CONSTRAINT IF EXISTS incident_comments_incident_id_fkey;

ALTER TABLE incident_requests
    ADD CONSTRAINT incident_requests_incident_id_fkey
        FOREIGN KEY (incident_id)
            REFERENCES incidents(incident_id)
            ON DELETE CASCADE;

ALTER TABLE incident_comments
    ADD CONSTRAINT incident_comments_incident_id_fkey
        FOREIGN KEY (incident_id)
            REFERENCES incidents(incident_id)
            ON DELETE CASCADE;

SELECT
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    confrelid::regclass AS foreign_table,
    confdeltype AS on_delete_action
FROM pg_constraint
WHERE contype = 'f'
  AND (conrelid::regclass::text = 'incident_requests'
       OR conrelid::regclass::text = 'incident_comments')
ORDER BY table_name;

-- exp:
-- on_delete_action = 'c'

COMMIT;


/*
INSERT INTO incidents (incident_id, incident_number, priority, status, category, created_by)
VALUES ('test-delete-001', 'INC-TEST-001', 1, 'new', 'network', 'admin_001');

INSERT INTO incident_requests (incident_id, request_id)
VALUES ('test-delete-001', 'req_001');

INSERT INTO incident_comments (comment_id, incident_id, comment_text, created_by)
VALUES ('comment-test-001', 'test-delete-001', 'Test comment', 'admin_001');

SELECT * FROM incidents WHERE incident_id = 'test-delete-001';
SELECT * FROM incident_requests WHERE incident_id = 'test-delete-001';
SELECT * FROM incident_comments WHERE incident_id = 'test-delete-001';

DELETE FROM incidents WHERE incident_id = 'test-delete-001';

--exp: empty
SELECT * FROM incidents WHERE incident_id = 'test-delete-001';
SELECT * FROM incident_requests WHERE incident_id = 'test-delete-001';
SELECT * FROM incident_comments WHERE incident_id = 'test-delete-001';
*/

--rollback
/*
BEGIN;

ALTER TABLE incident_requests
DROP CONSTRAINT IF EXISTS incident_requests_incident_id_fkey;

ALTER TABLE incident_comments
DROP CONSTRAINT IF EXISTS incident_comments_incident_id_fkey;

ALTER TABLE incident_requests
ADD CONSTRAINT incident_requests_incident_id_fkey
FOREIGN KEY (incident_id) REFERENCES incidents(incident_id);

ALTER TABLE incident_comments
ADD CONSTRAINT incident_comments_incident_id_fkey
FOREIGN KEY (incident_id) REFERENCES incidents(incident_id);

COMMIT;
*/