# searchScanner.js

## Purpose

Extract visible LinkedIn people profiles from search results and company people pages.

## Responsibilities

- Normalize profile URLs
- Traverse visible search result links
- Traverse visible company people cards
- Deduplicate profiles by profile URL
- Derive a best-effort headline from nearby visible text

## Inputs

- A DOM root, usually `document`
- Search result or company people page markup

## Outputs

- Array of profile objects with `name`, `profileUrl`, `headline`, `connectionDegree`, and `mutualConnections`

## Who Calls This Module

- `content.js`
- `apps/extension/test/searchTraversal.test.js`

## Which Modules It May Call

- None

## Which Modules It Must NEVER Call

- `background.js`
- `apps/backend/src/*`
- `verificationWorker.js`

## Files It Depends On

- No internal files

## Files Depending On It

- `apps/extension/content.js`
- `apps/extension/test/searchTraversal.test.js`

## Current Limitations

- The extraction heuristics are tuned for current fixture shapes and may miss unusual page layouts.
- Company people extraction relies on the current class name used in the committed fixture.

## Future Roadmap

- None documented in source code today.

## Related Tests

- `apps/extension/test/searchTraversal.test.js`

