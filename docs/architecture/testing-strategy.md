# Testing Strategy

## Current Tests

### Extension

- `apps/extension/test/searchTraversal.test.js`
- `apps/extension/test/profileHeader.test.js`
- `apps/extension/test/experienceExtractor.test.js`
- `apps/extension/test/activityPost.test.js`
- `apps/extension/test/activityPostType.test.js`
- `apps/extension/test/activityContent.test.js`
- `apps/extension/test/activityAvailability.test.js`
- `apps/extension/test/activitySignals.test.js`
- `apps/extension/test/activityAnalyzer.test.js`
- `apps/extension/test/activityIntelligence.test.js`
- `apps/extension/test/recentPosts.test.js`

### Fixtures

- `apps/extension/test-fixtures/people-search.html`
- `docs/html-snapshots/profile-page.html`
- `docs/html-snapshots/activity-page.html`
- `docs/html-snapshots/activity-image.html`
- `docs/html-snapshots/activity-video.html`
- `docs/html-snapshots/activity-document.html`
- `docs/html-snapshots/activity-repost.html`
- `docs/html-snapshots/company-people.html`

## Missing Tests

- Popup behavior tests
- Background workflow tests
- Message contract tests between `content.js` and `background.js`
- Backend route tests
- Backend validation tests
- In-memory scan store reset behavior tests
- Activity snapshot capture tests
- Company people scrolling/load-more regression tests

## Recommended Fixtures

- A LinkedIn company people page with multiple visible and hidden cards
- A LinkedIn profile page with multiple experience entries and partial data
- A LinkedIn activity page containing text, image, video, and document posts
- A profile page with ambiguous headline and location formatting

## Recommended Regression Tests

- Deduplication of repeated profile cards
- Search extraction on company people pages
- Verification payload shape sent to the backend
- Activity intelligence serialization contract
- Experience section parsing with one current and one past role
- Behavior when the backend has no pending profiles
- Snapshot capture output formatting

