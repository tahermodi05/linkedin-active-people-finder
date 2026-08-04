# Dashboard Module

## Purpose

The dashboard module exposes read-only backend endpoints for summarizing and inspecting scan sessions.

## Responsibilities

- Expose dashboard summary data for the current in-memory scan store.
- Return lightweight metadata for all scan sessions.
- Return the full details of a single scan session by scanId.

## Current Endpoints

- GET /api/dashboard/summary
- GET /api/dashboard/scans
- GET /api/dashboard/scans/:scanId

## Architecture Notes

- Controllers remain thin and delegate to the dashboard service.
- The dashboard service reuses the existing Scan Store API.
- The module is intentionally read-only and does not introduce persistence or authentication.
