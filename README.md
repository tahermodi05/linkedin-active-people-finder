# Veriq

Veriq is a developer tool for finding active LinkedIn people, verifying profile details, extracting activity intelligence, and reviewing scan results in a dashboard.

## Project overview

Veriq combines a Chrome extension, a backend API, and a lightweight React dashboard to support a full LinkedIn profile verification workflow.

- The Chrome extension scans LinkedIn search and company people pages for candidate profiles.
- The backend stores scan sessions, exposes verification and dashboard APIs, and supports PostgreSQL persistence or an in-memory fallback.
- The dashboard displays scan history, profile verification state, and activity intelligence.

## Project goal and purpose

The goal of Veriq is to simplify identification of active LinkedIn profiles and to provide a repeatable verification lifecycle that can: scan visible LinkedIn people results, verify profile data from profile pages, capture activity intelligence from activity pages, and persist results for review.

## High-level architecture

Veriq is organized into three main applications:

- `apps/extension`: Chrome extension runtime, including popup UI, background service worker, content script, extractors, activity intelligence, and workflow orchestration.
- `apps/backend`: Node.js + Express API server that validates input, manages scan sessions, exposes search and dashboard endpoints, and supports persistence.
- `apps/dashboard`: React + Vite dashboard for viewing scan results, individual scans, and profile cards.

The key architectural pattern is separation of concerns:

- The extension handles LinkedIn DOM interaction, profile extraction, tab orchestration, and workflow coordination.
- The backend handles persistence, session state, verification progress, API validation, and dashboard read models.
- The dashboard consumes backend APIs and renders scan and profile data.

## Extension workflow

1. A user loads the extension popup on a supported LinkedIn page.
2. The popup sends a `START_SCAN` request to `background.js`.
3. `background.js` asks the active LinkedIn tab to detect the page type and scan visible profiles via `content.js`.
4. `content.js` traverses search or company people results, loads more employees as needed, and returns normalized profile metadata.
5. The background script sends the profile list to the backend at `POST /api/search`.
6. The backend returns a `scanId` and stores the pending scan.
7. The background script starts the verification lifecycle using `workers/verificationWorker.js`.

### Popup UI

The popup provides three actions:

- `Scan Current Page`: scans the current LinkedIn search or company people page and starts verification.
- `View Results`: loads completed scan results from the backend.
- `Capture Activity Snapshot`: captures the HTML of the currently open LinkedIn activity page for manual inspection.

## Backend workflow

The backend is a thin Express API with the following responsibilities:

- Validate incoming scan payloads and verification data using `zod` schemas.
- Create and manage scan sessions through a repository abstraction.
- Provide `next` profile retrieval for the verification worker.
- Accept completed verification payloads and update session state.
- Expose dashboard and health endpoints.

### Core backend flow

- `POST /api/search`: create a new scan session with normalized profiles.
- `GET /api/search/next?scanId=...`: return the next pending profile for verification.
- `POST /api/search/complete`: accept verification results and persist profile state.
- `GET /api/search/results`: return the latest or a specific scan's profile results.
- `GET /api/search/latest`: return the most recent scan payload.

The backend also provides dashboard read models:

- `GET /api/dashboard/summary`
- `GET /api/dashboard/scans`
- `GET /api/dashboard/scans/:scanId`

Readiness is exposed through health routes:

- `GET /health`
- `GET /health/live`
- `GET /health/ready`

## Dashboard workflow

The dashboard is a React app that:

- Fetches all scans from `GET /api/dashboard/scans`.
- Displays scan metadata including status, total profiles, verified profiles, and verification rate.
- Loads a selected scan with `GET /api/dashboard/scans/:scanId`.
- Renders profile cards with verification state and activity intelligence.
- Supports client-side filtering and sorting of profiles.

The dashboard resolves its backend URL from `VITE_BACKEND_URL` and falls back to `http://localhost:3000`.

## Verification lifecycle

The verification workflow is coordinated by `apps/extension/workers/verificationWorker.js`.

1. The worker fetches the next pending profile from the backend.
2. It opens or reuses a single verification tab to navigate to the profile page.
3. It waits for `PROFILE_PAGE_READY` from the content script.
4. It sends `VERIFY_PROFILE` to the content script and waits for `PROFILE_VERIFIED`.
5. It navigates the same tab to the profile's recent activity page.
6. It waits for `ACTIVITY_PAGE_READY`.
7. It requests activity intelligence using `EXTRACT_ACTIVITY_INTELLIGENCE` and waits for `ACTIVITY_INTELLIGENCE_EXTRACTED`.
8. It sends the completed verification payload to `POST /api/search/complete`.
9. The cycle repeats until there are no more pending profiles.

### Reusable verification tab

- The worker caches a single verification tab ID in module state.
- If the cached tab exists, it updates the tab URL instead of creating a new tab.
- If the tab has been closed or update fails, the worker creates a new tab and caches its ID again.
- The lifecycle remains sequential and controlled by runtime messages exchanged with `content.js`.

## Database architecture

Veriq uses a repository abstraction to separate persistence from service logic.

### In-memory repository

The current default persistence layer is an in-memory repository implemented in `apps/backend/src/store/scanStore.js`.

- `createScanSession` stores a session object in memory.
- `getNextPendingProfile` returns the next profile still waiting for verification.
- `updateCurrentProfileVerification` updates the currently active profile record.
- `markCurrentProfileProcessed` advances the session index and completes the session when all profiles are verified.

### PostgreSQL repository

A Postgres repository implementation exists under `apps/backend/src/repositories/postgres/scanRepository.js` and is selected when `PERSISTENCE=postgres`.

- The service layer uses `apps/backend/src/repositories/repositorySelector.js` to choose persistence.
- `apps/backend/src/database/client.js` manages a Postgres connection pool and transaction helper.
- `apps/backend/src/database/schema/scan-schema.sql` contains a draft table schema for `scan_sessions` and `scan_profiles`.

### Data model

Scan sessions contain:

- `scanId`
- `status`
- `startedAt`
- `completedAt`
- `totalProfiles`
- `verifiedProfiles`
- `profiles[]`

Each profile contains:

- identity fields (`name`, `profileUrl`, `headline`)
- verification state and confidence
- activity intelligence payload
- `currentlyWorksHere`

## Features implemented

- LinkedIn search and company people page scanning.
- Profile metadata extraction and normalization.
- Backend scan session creation and pending profile queueing.
- Sequential verification lifecycle using a reusable browser tab.
- Recent activity page intelligence extraction.
- Capture of activity page HTML snapshots.
- Dashboard with scan list, scan detail, filter, and sort.
- Health endpoints and JSON structured logging.
- Environment-driven backend configuration and CORS controls.

## Folder structure

- `apps/extension`: Chrome extension code, popup UI, background service worker, content script, extractors, intelligence, scanners, and workflow worker.
- `apps/backend`: Express API server, controllers, services, persistence repository, health checks, and configuration.
- `apps/dashboard`: React + Vite dashboard.
- `docs`: architecture notes, module documentation, snapshots, and investigation artifacts.
- `docs/html-snapshots`: committed LinkedIn HTML fixtures.
- `apps/extension/test-fixtures`: HTML fixtures for extension tests.

## Important files

- `README.md` — this document.
- `docs/README.md` — project docs index.
- `apps/extension/manifest.json` — Chrome extension manifest.
- `apps/extension/popup.html` / `popup.js` — extension UI.
- `apps/extension/background.js` — extension orchestration entrypoint.
- `apps/extension/content.js` — LinkedIn page extraction and messaging.
- `apps/extension/workers/verificationWorker.js` — reusable verification tab and lifecycle orchestration.
- `apps/extension/services/backendApi.js` — extension backend API client.
- `apps/backend/src/index.js` — backend server bootstrap.
- `apps/backend/src/config/index.js` — backend environment configuration.
- `apps/backend/src/routes/searchRoutes.js` and `dashboardRoutes.js` — API route definitions.
- `apps/backend/src/repositories/scanRepository.js` — persistence boundary.
- `apps/backend/src/store/scanStore.js` — in-memory persistence implementation.
- `apps/dashboard/src/App.jsx` — dashboard front-end app.
- `apps/backend/src/config/.env.example` — backend environment example.
- `apps/dashboard/.env.example` — dashboard environment example.

## APIs and endpoints

### Search and verification

- `POST /api/search` — start a new scan with a list of profiles.
- `GET /api/search/next?scanId=...` — fetch the next pending profile for verification.
- `POST /api/search/complete` — submit a verified profile payload.
- `GET /api/search/results` — retrieve latest scan result profiles.
- `GET /api/search/results?scanId=...` — retrieve a specific scan result.
- `GET /api/search/latest` — retrieve the latest scan payload.

### Dashboard

- `GET /api/dashboard/summary` — summary metrics for all scans.
- `GET /api/dashboard/scans` — list all scans.
- `GET /api/dashboard/scans/:scanId` — details for a specific scan.

### Health

- `GET /health` — liveness-style health summary.
- `GET /health/live` — explicit liveness status.
- `GET /health/ready` — readiness status; validates Postgres connectivity when enabled.

## Environment variables

### Backend

Required in production:

- `PORT` — port for the backend server.
- `PERSISTENCE` — `postgres` or `memory`.
- `DB_HOST` — Postgres host.
- `DB_PORT` — Postgres port.
- `DB_NAME` — database name.
- `DB_USER` — database user.
- `DB_PASSWORD` — database password.
- `CORS_ORIGIN` — comma-separated allowed origins.
- `CORS_METHODS` — comma-separated allowed methods.
- `CORS_ALLOWED_HEADERS` — comma-separated allowed headers.

Development defaults in `apps/backend/src/config/index.js` are:

- `PERSISTENCE=postgres`
- `CORS_ORIGIN=http://localhost:4173,http://127.0.0.1:4173`
- `CORS_METHODS=GET,POST,OPTIONS`
- `CORS_ALLOWED_HEADERS=Content-Type,Authorization`

Example file:

- `apps/backend/src/config/.env.example`

### Dashboard

- `VITE_BACKEND_URL` — backend base URL used by the dashboard.

Example file:

- `apps/dashboard/.env.example`

### Extension

- `globalThis.__VERIQ_BACKEND_URL__` — runtime backend base URL for the extension.

If this value is not defined, the extension falls back to `http://localhost:3000`.

## Dependencies used

### Root workspace

- `pg` — Postgres client used by backend.
- `jsdom` — development/test dependency.

### Backend

- `express`
- `cors`
- `dotenv`
- `pg`
- `zod`
- `nodemon`

### Dashboard

- `react`
- `react-dom`
- `vite`
- `@vitejs/plugin-react`

### Extension

- Chrome Extension Manifest V3 APIs and browser runtime.

## Configuration

### Backend configuration

The backend is configured through environment variables and uses a small `config` module to parse and validate them.

- `PORT` is mandatory.
- `PERSISTENCE` selects persistence implementation.
- `CORS_ORIGIN`, `CORS_METHODS`, and `CORS_ALLOWED_HEADERS` define runtime CORS policies.
- In production (`NODE_ENV=production`), missing `DB_HOST`, `DB_NAME`, `DB_USER`, or `DB_PASSWORD` causes startup failure.

### Dashboard configuration

- `VITE_BACKEND_URL` overrides the backend endpoint used by the dashboard.
- The dashboard falls back to `http://localhost:3000`.

### Extension configuration

- `globalThis.__VERIQ_BACKEND_URL__` overrides the backend endpoint used by the extension.
- If unset, the extension defaults to `http://localhost:3000`.

## Testing performed

- Extension unit tests exist under `apps/extension/test/*.test.js`.
- The current root workspace `npm test` command runs Node test files.
- No backend test suite is present in the repository.

Current extension test files include:

- `searchTraversal.test.js`
- `profileHeader.test.js`
- `experienceExtractor.test.js`
- `activityPost.test.js`
- `activityPostType.test.js`
- `activityContent.test.js`
- `activityAvailability.test.js`
- `activitySignals.test.js`
- `activityAnalyzer.test.js`
- `activityIntelligence.test.js`
- `recentPosts.test.js`

## Bugs fixed during development

- Reusable verification tab lifecycle in `apps/extension/workers/verificationWorker.js`.
- Fixed backend startup in `apps/backend/src/index.js` and `apps/backend/src/repositories/repositorySelector.js` so `PERSISTENCE=memory` does not require Postgres dependencies at load time.
- Fixed in-memory scan session creation in `apps/backend/src/store/scanStore.js` to return the expected session summary.
- Removed temporary debug output introduced during previous validation.
- Fixed hardcoded backend URL in `apps/extension/popup.js` to reuse extension backend URL resolution.

## Production readiness summary

Veriq is functionally complete for v1.0 with the following readiness observations:

- The backend validates required production environment variables.
- The extension and dashboard resolve backend URLs from configuration while preserving local development defaults.
- Health and readiness endpoints are present and report Postgres connectivity when enabled.
- No accidental temporary debugging files remain.

## Known limitations

- The verification workflow is sequential and tab-driven.
- Verification tab reuse is cached in memory only and is not persisted across extension restarts.
- A full browser integration test is not included in the repository.
- Backend tests are limited; there is no dedicated backend API test suite in source control.
- The dashboard is intentionally lightweight and does not include pagination or authentication.
- The PostgreSQL schema file is draft and not automatically migrated by the project.

## Future improvements

- Add integration tests for background workflow and extension message contracts.
- Add backend route and validation tests.
- Improve persistence migration and Postgres schema automation.
- Add a more explicit state machine for the verification lifecycle.
- Add a production-ready deployment and CI pipeline.

## Setup instructions

1. Clone the repository.
2. Install dependencies from the workspace root:

```bash
npm install
```

3. Configure the backend:

```bash
cp apps/backend/src/config/.env.example apps/backend/src/config/.env
```

4. Configure the dashboard:

```bash
cp apps/dashboard/.env.example apps/dashboard/.env
```

5. Start the backend:

```bash
cd apps/backend
npm run dev
```

6. Start the dashboard:

```bash
cd apps/dashboard
npm run dev -- --host 0.0.0.0 --port 4173
```

7. Load the extension in Chrome:

- Open `chrome://extensions`
- Enable Developer mode
- Load unpacked extension from `apps/extension`

## Local development workflow

1. Open LinkedIn and navigate to a Company → People page or a search results page.
2. Click the extension popup and select `Scan Current Page`.
3. Wait for the backend scan session to start and for the verification workflow to process profiles.
4. Use `View Results` to load processed profiles.
5. Open the dashboard at the Vite preview URL (default `http://localhost:4173`) to inspect scans.
6. Use `Capture Activity Snapshot` on a LinkedIn activity page to download the current HTML snapshot.

## Deployment considerations

- Do not use development credentials in production.
- Set `NODE_ENV=production` and provide explicit `DB_HOST`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD`.
- Configure `PORT` and CORS settings appropriate for your deployment.
- Ensure the dashboard and extension backend URLs are set correctly for the production environment.
- The Docker Compose file provides a local Postgres dev environment only and is not intended as a production deployment manifest.

## Release notes for v1.0

Veriq v1.0 delivers:

- Core LinkedIn profile scanning and verification.
- A reusable verification tab lifecycle for sequential profile processing.
- Activity intelligence extraction from LinkedIn activity pages.
- Backend scan session persistence and dashboard read models.
- A lightweight React dashboard for reviewing scan and profile results.
- Health and diagnostics endpoints for runtime verification.

## Additional documentation

- `docs/README.md` — architecture index and module documentation.
- `docs/architecture/*.md` — deep-dive architecture and module boundary notes.
- `docs/modules/*.md` — module-specific documentation.
- `docs/html-snapshots` — committed LinkedIn HTML fixtures used for analysis and testing.
