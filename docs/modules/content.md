# content.js

## Purpose

Page-level runtime entrypoint for LinkedIn tabs. It detects the current page, answers extension messages, scans search/company people results, and emits profile/activity readiness messages.

## Responsibilities

- Detect LinkedIn page type from the current URL
- Listen for Chrome runtime messages
- Extract visible profiles from search and company people pages
- Notify the background worker when profile and activity pages are ready
- Build activity intelligence on activity pages
- Provide activity snapshot capture support through the background worker path

## Inputs

- Chrome runtime messages from `background.js`
- The current LinkedIn DOM
- Current `window.location`

## Outputs

- `PROFILE_PAGE_READY`
- `PROFILE_VERIFIED`
- `ACTIVITY_PAGE_READY`
- `ACTIVITY_INTELLIGENCE_EXTRACTED`
- Scan responses for `DETECT_PAGE` and `SCAN_SEARCH_RESULTS`

## Who Calls This Module

- Chrome on LinkedIn pages via the content script registration
- `background.js` via `chrome.tabs.sendMessage`

## Which Modules It May Call

- `scanners/searchScanner.js`
- `extractors/profileExtractor.js`
- `intelligence/activityIntelligence.js`

## Which Modules It Must NEVER Call

- `apps/backend/src/*`
- `background.js`
- `popup.js`

## Files It Depends On

- `apps/extension/scanners/searchScanner.js`
- `apps/extension/extractors/profileExtractor.js`
- `apps/extension/intelligence/activityIntelligence.js`
- `apps/extension/shared/messageTypes.js`

## Files Depending On It

- `apps/extension/background.js`
- `apps/extension/workers/verificationWorker.js`
- `apps/extension/test/searchTraversal.test.js` indirectly through the scanner contract

## Current Limitations

- DOM selectors are tuned to committed snapshots and may drift with LinkedIn markup changes.
- Activity snapshot capture is handled through the background path rather than directly in the content script.
- The file contains both page orchestration and message handling, so changes can affect multiple flows.

## Future Roadmap

- None documented in source code today.

## Related Tests

- `apps/extension/test/searchTraversal.test.js`
- `apps/extension/test/activityIntelligence.test.js`
- `apps/extension/test/activityContent.test.js`

