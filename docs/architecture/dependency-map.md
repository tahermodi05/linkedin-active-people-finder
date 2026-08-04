# Dependency Map

This document describes the current dependency graph in the repository.

## Allowed Dependencies

### Extension

- `apps/extension/popup.js` → `apps/extension/shared/messageTypes.js`
- `apps/extension/background.js` → `apps/extension/services/backendApi.js`
- `apps/extension/background.js` → `apps/extension/shared/messageTypes.js`
- `apps/extension/background.js` → `apps/extension/workers/verificationWorker.js`
- `apps/extension/content.js` → `apps/extension/scanners/searchScanner.js`
- `apps/extension/content.js` → `apps/extension/extractors/profileExtractor.js`
- `apps/extension/content.js` → `apps/extension/intelligence/activityIntelligence.js`
- `apps/extension/intelligence/activityIntelligence.js` → `apps/extension/extractors/recentPosts.js`
- `apps/extension/intelligence/activityIntelligence.js` → `apps/extension/signals/activitySignals.js`
- `apps/extension/intelligence/activityIntelligence.js` → `apps/extension/intelligence/activityAnalyzer.js`
- `apps/extension/extractors/profileExtractor.js` → `apps/extension/extractors/identityExtractor.js`
- `apps/extension/extractors/profileExtractor.js` → `apps/extension/extractors/experienceExtractor.js`
- `apps/extension/extractors/profileHeader.js` → `apps/extension/extractors/experienceExtractor.js`
- `apps/extension/extractors/profileHeaderV2.js` → `apps/extension/extractors/experienceExtractor.js`
- `apps/extension/extractors/recentPosts.js` → `apps/extension/extractors/activityPost.js`
- `apps/extension/signals/activitySignals.js` → none
- `apps/extension/scanners/searchScanner.js` → none
- `apps/extension/workers/verificationWorker.js` → `apps/extension/services/backendApi.js`
- `apps/extension/workers/verificationWorker.js` → `apps/extension/shared/messageTypes.js`
- `apps/extension/extractors/activityPost.js` → none
- `apps/extension/extractors/activityContent.js` → none
- `apps/extension/extractors/activityAvailability.js` → none
- `apps/extension/extractors/activityPostType.js` → none
- `apps/extension/extractors/identityExtractor.js` → none
- `apps/extension/extractors/experienceExtractor.js` → none

### Backend

- `apps/backend/src/index.js` → `apps/backend/src/config/index.js`
- `apps/backend/src/index.js` → `apps/backend/src/middleware/logger.js`
- `apps/backend/src/index.js` → `apps/backend/src/middleware/errorHandler.js`
- `apps/backend/src/index.js` → `apps/backend/src/routes/health.js`
- `apps/backend/src/index.js` → `apps/backend/src/routes/searchRoutes.js`
- `apps/backend/src/index.js` → `apps/backend/src/routes/dashboardRoutes.js`
- `apps/backend/src/controllers/healthController.js` → `apps/backend/src/services/healthService.js`
- `apps/backend/src/controllers/searchController.js` → `apps/backend/src/services/searchService.js`
- `apps/backend/src/controllers/searchController.js` → `apps/backend/src/utils/response.js`
- `apps/backend/src/controllers/dashboardController.js` → `apps/backend/src/services/dashboardService.js`
- `apps/backend/src/routes/health.js` → `apps/backend/src/controllers/healthController.js`
- `apps/backend/src/routes/searchRoutes.js` → `apps/backend/src/controllers/searchController.js`
- `apps/backend/src/routes/searchRoutes.js` → `apps/backend/src/middleware/validate.js`
- `apps/backend/src/routes/searchRoutes.js` → `apps/backend/src/schemas/searchSchema.js`
- `apps/backend/src/routes/searchRoutes.js` → `apps/backend/src/schemas/completeVerificationSchema.js`
- `apps/backend/src/routes/dashboardRoutes.js` → `apps/backend/src/controllers/dashboardController.js`
- `apps/backend/src/services/searchService.js` → `apps/backend/src/store/scanStore.js`
- `apps/backend/src/services/dashboardService.js` → `apps/backend/src/store/scanStore.js`
- `apps/backend/src/middleware/errorHandler.js` → `apps/backend/src/utils/response.js`
- `apps/backend/src/middleware/errorHandler.js` → `apps/backend/src/errors/AppError.js`
- `apps/backend/src/middleware/validate.js` → `zod`
- `apps/backend/src/config/index.js` → `process.env.PORT`
- `apps/backend/src/config/index.js` → no internal modules

### Shared assets and tests

- Tests depend on `docs/html-snapshots/*` and `apps/extension/test-fixtures/*`
- Extension tests depend on `jsdom`

## Forbidden Dependencies

These are the current architectural prohibitions inferred from the existing module layout and runtime flow:

- `content.js` must not call backend routes directly
- `content.js` must not contain backend persistence logic
- `background.js` must not parse LinkedIn DOM
- `background.js` must not contain selector logic for profile or activity extraction
- `searchScanner.js` must not talk to the backend
- `experienceExtractor.js` must not depend on `background.js`
- `identityExtractor.js` must not depend on `background.js`
- `verificationWorker.js` must not extract DOM directly
- Backend controllers must not inspect the DOM
- Backend services must not call Chrome extension APIs
- `popup.js` must not perform DOM extraction

## Dependency Notes

- The backend currently stores scan state in memory through `scanStore.js`.
- The extension currently uses dynamic imports for extractor and intelligence modules via `chrome.runtime.getURL(...)`.
- `content.js` is the runtime orchestrator for page detection and message handling on LinkedIn pages.

