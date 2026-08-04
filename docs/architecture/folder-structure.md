# Folder Structure

## `apps/extension`

Purpose: Chrome extension runtime for scanning LinkedIn pages, verifying profiles, and capturing activity snapshots.

What belongs here:

- Popup UI
- Background service worker
- Content script
- Scanners
- Extractors
- Activity intelligence modules
- Message type constants
- Extension tests

What must never be placed here:

- Backend server code
- Persistent application data
- Build artifacts unrelated to the extension

## `apps/extension/extractors`

Purpose: DOM parsers and normalizers for profile and activity data.

What belongs here:

- Identity extraction
- Experience extraction
- Profile composition
- Activity post extraction
- Activity content extraction

What must never be placed here:

- Chrome messaging
- Backend API calls
- Tab orchestration

## `apps/extension/intelligence`

Purpose: Higher-level analysis over extracted activity data.

What belongs here:

- Activity aggregation
- Activity metrics
- Activity analysis

What must never be placed here:

- Raw tab control
- Backend storage
- Search traversal logic

## `apps/extension/scanners`

Purpose: Page-level scanning for people results.

What belongs here:

- Search page traversal
- Company people page traversal
- Link normalization
- Deduplication

What must never be placed here:

- Profile verification workflow
- Activity intelligence
- Backend operations

## `apps/extension/signals`

Purpose: Derived signal summaries for activity data.

What belongs here:

- Counts and simple booleans derived from extracted posts

What must never be placed here:

- DOM traversal
- Backend logic

## `apps/extension/services`

Purpose: Client-side service wrappers for backend communication.

What belongs here:

- Fetch wrappers
- API helper functions

What must never be placed here:

- DOM parsing
- UI rendering

## `apps/extension/workers`

Purpose: Long-running workflows that coordinate tabs, messages, and backend calls.

What belongs here:

- Verification lifecycle
- Profile verification orchestration
- Activity extraction orchestration

What must never be placed here:

- Selector-heavy parsing logic
- Pure extraction rules

## `apps/extension/shared`

Purpose: Shared extension contracts and types.

What belongs here:

- Message type constants
- Shared type declarations

What must never be placed here:

- Business logic
- Environment-specific control flow

## `apps/backend`

Purpose: HTTP API for scan results, verification progress, dashboard reads, and health checks.

What belongs here:

- Express server bootstrap
- Search routes and dashboard routes
- Thin controllers
- Search and dashboard services
- Validation schemas
- Error handling
- Utilities
- In-memory scan store and scan-session state

What must never be placed here:

- Chrome extension code
- LinkedIn DOM extraction

## `docs/html-snapshots`

Purpose: Committed HTML snapshots used to stabilize documentation and tests.

What belongs here:

- Canonical HTML fixtures

What must never be placed here:

- Runtime application code

## `apps/extension/test-fixtures`

Purpose: Smaller HTML fixtures for extension traversal tests.

What belongs here:

- Static LinkedIn page fixtures

What must never be placed here:

- Production code

