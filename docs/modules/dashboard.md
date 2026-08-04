# Dashboard Module

## Purpose

The dashboard module exposes read-only backend endpoints for summarizing and inspecting scan sessions, and it now powers a lightweight MVP web dashboard.

## Responsibilities

- Expose dashboard summary data for the current scan workflow.
- Return lightweight metadata for all scan sessions.
- Return the full details of a single scan session by scanId.
- Surface profile intelligence and verification progress to the dashboard UI.

## Current Endpoints

- GET /api/dashboard/summary
- GET /api/dashboard/scans
- GET /api/dashboard/scans/:scanId

## MVP Dashboard Features

- Scan list with status, profile counts, and verification rate.
- Scan detail view with scan metadata and profile summaries.
- Profile intelligence cards with identity, verification, and activity information.
- Simple client-side filtering and sorting for profiles.

## Architecture Notes

- Controllers remain thin and delegate to the dashboard service.
- The dashboard service reuses the existing repository-backed scan workflow.
- The module is intentionally read-only and does not introduce persistence or authentication.
