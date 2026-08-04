# Documentation Index

This directory is the source of truth for Veriq architecture and operating rules.

## Architecture

- [Dependency Map](./architecture/dependency-map.md)
- [Module Boundaries](./architecture/module-boundaries.md)
- [Data Flow](./architecture/data-flow.md)
- [Message Flow](./architecture/message-flow.md)
- [Testing Strategy](./architecture/testing-strategy.md)
- [Documentation Rules](./architecture/documentation-rules.md)
- [Regression Checklist](./architecture/regression-checklist.md)
- [Folder Structure](./architecture/folder-structure.md)
- [Coding Principles](./architecture/coding-principles.md)

## Backend Architecture

The backend is organized as a thin layered API:

- Controllers handle HTTP request/response flow and delegate to services.
- Services contain the search and dashboard workflow logic.
- The Repository layer owns scan-session persistence and exposes summary/list/detail access.
- The dashboard module reuses the repository layer rather than introducing a separate persistence layer.

### MVP Dashboard Milestone

The current milestone adds a lightweight React + Vite dashboard app for viewing scan results and profile intelligence.

#### User flow

1. Start the backend and dashboard locally.
2. Open the dashboard and view the scan list.
3. Open a scan to review its metadata, profile cards, and verification state.

#### Dashboard features

- Scan list with status, profile counts, and verification rate.
- Scan detail view with per-scan metadata.
- Profile intelligence cards with identity, verification, and activity data.
- Simple client-side filtering and sorting for profiles.

#### Backend improvements

- PostgreSQL is now the default local persistence path for scan lifecycle state.
- Dashboard APIs expose richer summary and detail payloads with verification-derived fields.
- Legacy search responses remain compatible for existing consumers.

### Current API surface

- Search module: POST /api/search, POST /api/search/complete, GET /api/search/results, GET /api/search/latest, GET /api/search/next
- Dashboard module: GET /api/dashboard/summary, GET /api/dashboard/scans, GET /api/dashboard/scans/:scanId

### Scan Sessions v1

- Each search creates a backend-generated scanId.
- Each scan session carries metadata including status, startedAt, completedAt, totalProfiles, and verifiedProfiles.
- Verification updates the active session while preserving backward compatibility for legacy scan endpoints.

### Local development

- Backend: `cd apps/backend && npm start`
- Dashboard: `npm run dev --workspace apps/dashboard -- --host 0.0.0.0 --port 4173`

## Modules

- [content](./modules/content.md)
- [background](./modules/background.md)
- [dashboard](./modules/dashboard.md)
- [searchScanner](./modules/searchScanner.md)
- [identityExtractor](./modules/identityExtractor.md)
- [profileExtractor](./modules/profileExtractor.md)
- [experienceExtractor](./modules/experienceExtractor.md)
- [verificationWorker](./modules/verificationWorker.md)

