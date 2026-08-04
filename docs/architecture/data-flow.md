# Data Flow

## Search Flow

1. User clicks `Scan Current Page` in the popup.
2. `popup.js` sends `START_SCAN` to `background.js`.
3. `background.js` asks the active LinkedIn tab to detect the page.
4. If the page is supported, `background.js` sends `SCAN_SEARCH_RESULTS`.
5. `content.js` loads visible people profiles from the current page.
6. `searchScanner.js` extracts and deduplicates profile records.
7. `background.js` posts the profiles to `POST /api/search`.
8. `searchService.js` stores the profiles in memory and marks them pending verification.

## Verification Flow

1. `verificationWorker.js` asks the backend for the next pending profile.
2. The worker opens the profile in a background tab.
3. `content.js` on the profile page emits `PROFILE_PAGE_READY`.
4. The worker sends `VERIFY_PROFILE`.
5. `content.js` extracts identity and experience data using `profileExtractor.js`.
6. `content.js` emits `PROFILE_VERIFIED`.
7. The worker updates the tab to the profile activity URL.
8. `content.js` emits `ACTIVITY_PAGE_READY`.
9. The worker sends `EXTRACT_ACTIVITY_INTELLIGENCE`.
10. `content.js` builds activity intelligence and emits `ACTIVITY_INTELLIGENCE_EXTRACTED`.
11. The worker sends completion data to `POST /api/search/complete`, which updates the active scan session in the backend store.

## Backend Scan Session Flow

1. The extension sends profiles to `POST /api/search`.
2. The backend creates a scan session with a backend-generated `scanId` and initial metadata.
3. The session starts with `status: "running"`, `startedAt`, `completedAt: null`, `totalProfiles`, and `verifiedProfiles: 0`.
4. Verification progress updates the active profile and advances the session.
5. When the last profile is processed, the session is marked `completed` and `completedAt` is set.
6. Dashboard endpoints read the same session objects through the Scan Store API.

## Activity Flow

1. Activity pages are detected by `content.js`.
2. `content.js` waits for visible activity posts.
3. `activityIntelligence.js` extracts recent posts through `recentPosts.js`.
4. `buildActivitySignals()` computes post-level signal counts.
5. `activityAnalyzer.js` computes media breakdowns.
6. Serialized activity intelligence is returned to the background worker.

## Experience Extraction Flow

1. `profileExtractor.js` calls `identityExtractor.js`.
2. `profileExtractor.js` calls `experienceExtractor.js`.
3. `experienceExtractor.js` locates the Experience section.
4. It extracts current company, role, and a structured list of positions.
5. The result is serialized into the verification payload.

## Identity Extraction Flow

1. `profileExtractor.js` delegates to `identityExtractor.js`.
2. `identityExtractor.js` reads the profile URL from the active window location.
3. It extracts the name, headline, and location from the top profile card.
4. The identity payload is combined with experience data for verification.

