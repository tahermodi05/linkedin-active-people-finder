# verificationWorker.js

## Purpose

Coordinate the end-to-end verification workflow across backend state, LinkedIn profile tabs, and activity extraction.

## Responsibilities

- Pull the next pending profile from the backend
- Open verification tabs in the browser
- Wait for profile readiness
- Trigger profile verification
- Wait for the verification result
- Move the tab to the activity page
- Wait for activity readiness
- Request activity intelligence
- Submit the final verification payload

## Inputs

- Backend queue state
- Chrome tab state
- Runtime messages from content scripts

## Outputs

- Verified profile completion sent to the backend
- Activity intelligence request and response handling

## Who Calls This Module

- `background.js`

## Which Modules It May Call

- `services/backendApi.js`

## Which Modules It Must NEVER Call

- DOM extraction modules directly
- Popup UI logic
- Backend stores directly

## Files It Depends On

- `apps/extension/services/backendApi.js`
- `apps/extension/shared/messageTypes.js`

## Files Depending On It

- `apps/extension/background.js`

## Verification Tab Lifecycle

- The worker maintains a single in-memory reusable verification tab (cached in module state).
- For each profile the worker attempts to reuse the cached tab by updating its URL via `chrome.tabs.update()` instead of creating a new tab.
- If the cached tab has been closed or the update fails, the worker creates a new tab and caches its id for subsequent reuse.
- The lifecycle sequence remains: open/reuse verification tab → wait for profile readiness → send verification request → navigate to activity page → request activity intelligence. The existing `startVerificationLifecycle()` function drives this behavior and remains unchanged.

## Manual Verification

To manually verify the reusable verification tab behavior:

1. Open the extension background page console so logs are visible.
2. Ensure there are multiple profiles available for verification (or mock the backend to return three profiles).
3. Trigger `startVerificationLifecycle()` so the worker processes profiles sequentially.
4. Watch console logs: the first profile should log a created tab id ("Opened verification tab <id>"). Subsequent profiles should log the same tab id — indicating the tab was reused via `chrome.tabs.update()`.
5. Close the verification tab while the lifecycle is idle and repeat; the worker should create a new tab and cache its id (a different id will be logged).
6. Note: the tab id is cached in-memory only; it is not persisted across extension restarts.

## Current Limitations

- The workflow is sequential and tab-driven.
- It depends on timing and runtime messages from the content script.
- `currentActivityIntelligence` is initialized but not yet used to drive a more explicit state machine.
- The verification tab id is cached in-memory only; it is not persisted across extension restarts, and the reuse relies on the tab remaining open during the lifecycle.

## Future Roadmap

- Introduce a more explicit state machine that drives lifecycle transitions (profile-ready → verifying → activity → completed) driven by `currentActivityIntelligence` and runtime messages.
- Improve robustness around tab lifecycle and recovery: consider persisting the cached tab id or using a centralized tab manager that reconciles closed tabs and tab events.

## Related Tests

- No direct automated tests currently exist for the worker.

