-- Nile Stock PostgreSQL state store.
-- The application creates this table automatically; this file is provided for review and manual provisioning.
CREATE TABLE IF NOT EXISTS nile_app_state (
  id SMALLINT PRIMARY KEY CHECK (id = 1),
  state JSONB NOT NULL,
  schema_version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE nile_app_state IS 'Durable transactional state for a single Nile Stock installation';
CREATE INDEX IF NOT EXISTS nile_app_state_updated_at_idx ON nile_app_state (updated_at);
