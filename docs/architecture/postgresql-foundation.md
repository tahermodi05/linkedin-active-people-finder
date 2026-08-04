# PostgreSQL Foundation

## Purpose

This document describes the future PostgreSQL persistence layer for Veriq.

The current application continues using in-memory persistence.

PostgreSQL will be introduced without changing service or controller responsibilities.

## Current Flow

Services
↓
Repository
↓
In-memory Store

## Future Flow

Services
↓
Repository
↓
PostgreSQL Repository
↓
PostgreSQL Database

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

The application continues using the memory repository by default.

- `createScanProfile` PostgreSQL operation prepared
- `getScanSession` PostgreSQL operation prepared