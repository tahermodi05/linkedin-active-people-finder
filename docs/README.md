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
- The Scan Store API owns in-memory scan-session state and exposes summary/list/detail access.
- The dashboard module reuses the same scan-session store rather than introducing a separate persistence layer.

### Current backend flow

```text
Chrome Extension
        │
        ▼
Express API
        │
 ┌───────────────┐
 │ Search Module │
 └───────────────┘
        │
 ┌─────────────────┐
 │ Dashboard Module│
 └─────────────────┘
        │
        ▼
Scan Store API
        │
        ▼
In-Memory Store
        │
(Future PostgreSQL)
```

### Current API surface

- Search module: POST /api/search, POST /api/search/complete, GET /api/search/results, GET /api/search/latest, GET /api/search/next
- Dashboard module: GET /api/dashboard/summary, GET /api/dashboard/scans, GET /api/dashboard/scans/:scanId

### Scan Sessions v1

- Each search creates a backend-generated scanId.
- Each scan session carries metadata including status, startedAt, completedAt, totalProfiles, and verifiedProfiles.
- Verification updates the active session while preserving backward compatibility for legacy scan endpoints.

## Modules

- [content](./modules/content.md)
- [background](./modules/background.md)
- [dashboard](./modules/dashboard.md)
- [searchScanner](./modules/searchScanner.md)
- [identityExtractor](./modules/identityExtractor.md)
- [profileExtractor](./modules/profileExtractor.md)
- [experienceExtractor](./modules/experienceExtractor.md)
- [verificationWorker](./modules/verificationWorker.md)

