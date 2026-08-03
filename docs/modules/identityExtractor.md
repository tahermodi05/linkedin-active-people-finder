# identityExtractor.js

## Purpose

Extract identity fields from a LinkedIn profile page.

## Responsibilities

- Read profile URL from the current page location
- Extract full name from the top profile card
- Extract headline from the top profile card
- Extract location from the top profile card

## Inputs

- Profile page DOM root

## Outputs

- `{ profileUrl, fullName, headline, location }`

## Who Calls This Module

- `profileExtractor.js`

## Which Modules It May Call

- None

## Which Modules It Must NEVER Call

- Backend modules
- Search scanners
- Content script messaging

## Files It Depends On

- No internal files

## Files Depending On It

- `apps/extension/extractors/profileExtractor.js`

## Current Limitations

- The extraction logic depends on observed LinkedIn profile markup and may under-report fields when the page structure changes.

## Future Roadmap

- None documented in source code today.

## Related Tests

- `apps/extension/test/profileHeader.test.js`

