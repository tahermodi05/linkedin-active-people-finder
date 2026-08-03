# profileExtractor.js

## Purpose

Combine identity and experience extraction into the verification payload used by the content script.

## Responsibilities

- Call identity extraction
- Call experience extraction
- Flatten the combined data into a single profile object

## Inputs

- Profile page DOM root

## Outputs

- Profile verification object with identity and employment fields

## Who Calls This Module

- `content.js`

## Which Modules It May Call

- `identityExtractor.js`
- `experienceExtractor.js`

## Which Modules It Must NEVER Call

- Backend modules
- Popup logic
- Search scanners

## Files It Depends On

- `apps/extension/extractors/identityExtractor.js`
- `apps/extension/extractors/experienceExtractor.js`

## Files Depending On It

- `apps/extension/content.js`

## Current Limitations

- It inherits all limitations from the identity and experience extractors.

## Future Roadmap

- None documented in source code today.

## Related Tests

- `apps/extension/test/profileHeader.test.js`
- `apps/extension/test/experienceExtractor.test.js`

