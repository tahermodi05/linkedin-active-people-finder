# Module Boundaries

This document defines what belongs in each major module today.

## `content.js`

Allowed

- Page detection
- DOM polling
- Message handling for page-level runtime events
- Orchestrating extraction modules

Not allowed

- Business logic that belongs in extractors or intelligence modules
- Backend decisions
- Persistence
- Profile verification policy
- Experience parsing internals

## `background.js`

Allowed

- Popup-to-tab orchestration
- Chrome tab creation and navigation
- Backend API calls
- Verification lifecycle coordination
- Activity snapshot capture requests

Not allowed

- DOM parsing
- LinkedIn selector logic
- Profile extraction rules
- Activity extraction rules

## `scanners/searchScanner.js`

Allowed

- Discovering visible LinkedIn people results
- Normalizing profile URLs
- Deduplicating visible result rows

Not allowed

- Backend requests
- Tab orchestration
- Verification workflow
- Activity intelligence

## `extractors/identityExtractor.js`

Allowed

- Deriving identity fields from profile DOM
- Normalizing profile URL, name, headline, and location

Not allowed

- Experience parsing
- Backend logic
- Search result scanning

## `extractors/profileExtractor.js`

Allowed

- Composing identity and experience extraction
- Returning a flattened profile object for verification

Not allowed

- Direct Chrome messaging
- Backend mutation
- Search scanning

## `extractors/experienceExtractor.js`

Allowed

- Locating the Experience section
- Parsing current company, role, and employment confidence
- Returning structured experience entries

Not allowed

- Identity extraction rules
- Backend state updates
- Search result traversal

## `workers/verificationWorker.js`

Allowed

- Requesting the next profile from the backend
- Opening verification tabs
- Waiting for `PROFILE_PAGE_READY`
- Sending `VERIFY_PROFILE`
- Waiting for `PROFILE_VERIFIED`
- Navigating to activity pages
- Waiting for `ACTIVITY_PAGE_READY`
- Requesting activity intelligence
- Persisting verification completion

Not allowed

- Raw DOM parsing
- Selector logic
- Local state beyond workflow coordination

## `intelligence/activityIntelligence.js`

Allowed

- Building activity intelligence from recent posts
- Combining post extraction, signals, and analysis

Not allowed

- Direct tab or popup orchestration
- Backend persistence
- Search scanning

## `apps/backend/src/*`

Allowed

- Input validation
- HTTP routing
- Controllers that remain thin and delegate to services
- Services that own search and dashboard workflow logic
- In-memory scan-session state through the Scan Store API
- Health reporting
- JSON response formatting

Not allowed

- Chrome extension APIs
- LinkedIn DOM parsing
- UI orchestration
- Business logic in controllers

