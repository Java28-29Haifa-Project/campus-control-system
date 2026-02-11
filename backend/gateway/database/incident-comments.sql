CREATE TABLE incident_comments (
                                   comment_id VARCHAR(50) PRIMARY KEY,
                                   incident_id VARCHAR(50) NOT NULL REFERENCES incidents(incident_id) ON DELETE CASCADE,
                                   comment_text TEXT NOT NULL,
                                   created_by VARCHAR(50) NOT NULL,
                                   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                                   CONSTRAINT comment_text_not_empty CHECK (LENGTH(TRIM(comment_text)) > 0)
);

CREATE INDEX idx_incident_comments_incident ON incident_comments(incident_id, created_at DESC);
CREATE INDEX idx_incident_comments_created_by ON incident_comments(created_by);

CREATE TRIGGER update_incident_comments_updated_at
    BEFORE UPDATE ON incident_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE incidents
    ADD COLUMN IF NOT EXISTS updated_by VARCHAR(50);

CREATE OR REPLACE FUNCTION update_incidents_updated_by()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;