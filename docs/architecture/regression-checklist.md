# Regression Checklist

Run this checklist before every commit.

## Search Scanner

- Verify people search extraction still returns deduplicated profiles.
- Verify company people cards are extracted only from visible cards.
- Verify profile URLs are normalized to canonical `/in/` URLs.

## Company People Scanner

- Verify `loadAllEmployees()` still stops when no more employees are available.
- Verify the load-more loop does not regress on supported company people pages.

## Verification

- Verify `PROFILE_PAGE_READY` still arrives before profile extraction.
- Verify `VERIFY_PROFILE` still returns the expected verification payload.
- Verify `PROFILE_VERIFIED` still includes the profile URL and identity fields.
- Verify backend completion still advances the pending profile queue.

## Experience

- Verify current company and current role are still detected from the Experience section.
- Verify employment confidence remains stable for partial data.

## Activity

- Verify activity page detection still works.
- Verify recent posts extraction still finds text, image, video, and document posts.
- Verify activity intelligence serialization still matches the popup and worker contract.

## Backend

- Verify `/health`, `/api/search`, `/api/search/results`, `/api/search/latest`, `/api/search/next`, and `/api/search/complete` still respond as expected.
- Verify the in-memory scan store still resets pending verification state on new scans.

## API

- Verify the search payload still validates `profiles[]`.
- Verify completion payloads still require `verificationStatus` and `currentlyWorksHere`.
- Verify error responses stay machine-readable.

## Tests

- Run the full Node test suite.
- Re-run the extension fixture tests after any DOM or selector change.
- Re-run backend validation tests after any schema or route change.

