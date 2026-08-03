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

## Current Limitations

- The workflow is sequential and tab-driven.
- It depends on timing and runtime messages from the content script.
- `currentActivityIntelligence` is initialized but not yet used to drive a more explicit state machine.

## Future Roadmap

- None documented in source code today.

## Related Tests

- No direct automated tests currently exist for the worker.

