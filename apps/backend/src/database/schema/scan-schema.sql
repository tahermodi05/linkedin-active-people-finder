-- Draft schema only.
-- Not a migration.
-- Not executed yet.

CREATE TABLE scan_sessions (
  id SERIAL PRIMARY KEY,
  scan_id UUID NOT NULL UNIQUE,
  status VARCHAR(50) NOT NULL,
  started_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  total_profiles INTEGER NOT NULL DEFAULT 0,
  verified_profiles INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE scan_profiles (
  id SERIAL PRIMARY KEY,
  scan_id UUID NOT NULL REFERENCES scan_sessions(scan_id),
  name TEXT NOT NULL,
  profile_url TEXT NOT NULL,
  headline TEXT,
  connection_degree TEXT,
  mutual_connections TEXT,
  verification_status VARCHAR(50),
  currently_works_here BOOLEAN,
  verified_at TIMESTAMP,
  activity_intelligence JSONB,
  verification_confidence JSONB
);