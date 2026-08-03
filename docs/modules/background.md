# background.js

## Purpose

Extension service worker that coordinates popup actions, tab orchestration, backend calls, and the verification lifecycle.

## Responsibilities

- Handle popup requests
- Detect the active tab
- Ask the content script to detect the current LinkedIn page
- Send scan results to the backend
- Start the verification worker
- Capture LinkedIn activity snapshots

## Inputs

- `START_SCAN`
- `CAPTURE_ACTIVITY_SNAPSHOT`
- Active tab state from Chrome
- Backend API responses

## Outputs

- Popup response messages
- Backend scan submissions
- Activity snapshot HTML
- Calls into the verification lifecycle

## Who Calls This Module

- `popup.js`
- Chrome runtime event delivery

## Which Modules It May Call

- `services/backendApi.js`
- `workers/verificationWorker.js`

## Which Modules It Must NEVER Call

- `content.js` parsing helpers directly
- Backend store internals
- Any extractor module directly

## Files It Depends On

- `apps/extension/services/backendApi.js`
- `apps/extension/shared/messageTypes.js`
- `apps/extension/workers/verificationWorker.js`

## Files Depending On It

- `apps/extension/popup.js`
- `apps/extension/workers/verificationWorker.js`
- `apps/extension/content.js` indirectly through message delivery

## Current Limitations

- Scan submission waits for backend success but does not currently consume the backend response body beyond basic status checking.
- The activity snapshot path is tightly coupled to LinkedIn page presence and active-tab state.

## Future Roadmap

- None documented in source code today.

## Related Tests

- No direct automated tests currently exist for the background worker.

