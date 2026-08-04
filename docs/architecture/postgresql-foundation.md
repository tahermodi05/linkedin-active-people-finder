# PostgreSQL Foundation

## Purpose

This document describes the PostgreSQL persistence layer for Veriq.

PostgreSQL is now the default persistence path for the scan workflow in local development.
Memory persistence remains available through explicit configuration.
The repository boundary remains unchanged and services/controllers do not need to know about the storage implementation.

## Current Flow

Services
↓
Repository
↓
PostgreSQL Repository
↓
PostgreSQL Database

## Explicit Memory Override

Memory persistence remains available when `PERSISTENCE=memory` is set explicitly.

## Initial Data Areas

The first PostgreSQL implementation will support:

- Scan sessions
- Profiles attached to scans
- Verification progress
- Verification results

## Design Rules

- No ORM initially
- No migrations yet
- No persistence switch yet
- Repository boundary must remain unchanged
- Controllers and services should not know database details

## Initial Table Draft

### scan_sessions

Purpose:
Stores search scan lifecycle information.

Fields:

- id
- scan_id
- status
- started_at
- completed_at
- total_profiles
- verified_profiles

### scan_profiles

Purpose:
Stores profiles discovered during a scan.

Fields:

- id
- scan_id
- name
- profile_url
- headline
- connection_degree
- mutual_connections
- verification_status
- currently_works_here
- verified_at
- activity_intelligence
- verification_confidence

## PostgreSQL Repository Implementation Status

Current progress:

- Database client configured
- Database schema drafted
- Query layer created
- Repository selector added
- `createScanSession` PostgreSQL operation implemented

Not implemented yet:

- Profile inserts
- Scan retrieval
- Dashboard queries
- Verification updates
- Full PostgreSQL persistence switch

The application now defaults to the PostgreSQL repository in local development.

- `createScanProfile` PostgreSQL operation prepared
- `getScanSession` PostgreSQL operation prepared

## Repository Migration Completion

The PostgreSQL scan repository migration is now implemented for the core scan-session workflow.

Implemented PostgreSQL scan repository methods:

- `createScanSession`
- `getScanSession`
- `getLatestScan`
- `setLatestScan`
- `getNextPendingProfile`
- `getAllScanSessions`
- `getDashboardSummary`
- `updateCurrentProfileVerification`
- `markCurrentProfileProcessed`

The repository remains behind the existing repository abstraction.
Existing services and controllers were not changed.

## Contract Alignment

PostgreSQL rows are mapped into the application contract used by the in-memory store.
Field naming is aligned with the existing store behavior.
Profile and session responses preserve the expected application shapes.
Pending profile processing behavior was aligned with the existing store behavior.

## MVP Dashboard Alignment

The PostgreSQL-backed scan workflow now supports the MVP dashboard milestone.

Implemented improvements include:

- PostgreSQL-backed scan lifecycle persistence for session and profile state.
- Dashboard summary and detail payloads with verification-derived fields such as pending profiles, failed profiles, and verification rate.
- Compatibility restoration for the legacy search API response shape.

## Testing Status

Backend startup was verified.
API health response was verified.
JavaScript syntax checks were performed.
The existing test suite passed: 29 tests passed.
Real PostgreSQL repository verification was completed successfully against the local PostgreSQL instance.
The verification script at `apps/backend/scripts/verify-postgres-repository.js` exercised `createScanSession`, `getScanSession`, `setLatestScan`, `getLatestScan`, and `getDashboardSummary`.
Startup validation now checks PostgreSQL connectivity when PostgreSQL is selected.

## Local Development Setup

Local PostgreSQL can be started with Docker Compose from the repository root:

```bash
docker compose up -d postgres
```

The local development database uses:

- host: `localhost`
- port: `5432`
- database: `veriq`
- user: `postgres`
- password: `postgres`

Required environment variables for the backend are:

- `DB_HOST=localhost`
- `DB_PORT=5432`
- `DB_NAME=veriq`
- `DB_USER=postgres`
- `DB_PASSWORD=postgres`

The scan schema can be applied manually with:

```bash
psql "postgresql://postgres:postgres@localhost:5432/veriq" -f apps/backend/src/database/schema/scan-schema.sql
```

The schema file remains a local development scaffold and does not change the existing repository architecture.

## Schema Application Before Repository Tests

The PostgreSQL schema file at `apps/backend/src/database/schema/scan-schema.sql` must be applied before running PostgreSQL repository tests.
It creates the required PostgreSQL tables for scan sessions and scan profiles.