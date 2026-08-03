# experienceExtractor.js

## Purpose

Extract structured work history from the LinkedIn Experience section and infer current employment.

## Responsibilities

- Locate the Experience section
- Identify visible experience cards
- Parse role, company, dates, and duration
- Infer current company and current role
- Assign an employment confidence level

## Inputs

- Profile page DOM root

## Outputs

- `{ currentCompany, currentRole, currentlyWorking, employmentConfidence, experience }`

## Who Calls This Module

- `profileExtractor.js`
- `profileHeader.js`
- `profileHeaderV2.js`
- `apps/extension/test/experienceExtractor.test.js`

## Which Modules It May Call

- None

## Which Modules It Must NEVER Call

- Backend modules
- Search scanners
- Message routing code

## Files It Depends On

- No internal files

## Files Depending On It

- `apps/extension/extractors/profileExtractor.js`
- `apps/extension/extractors/profileHeader.js`
- `apps/extension/extractors/profileHeaderV2.js`
- `apps/extension/test/experienceExtractor.test.js`

## Current Limitations

- It uses heuristic parsing for dates, companies, and roles.
- Multi-position experiences are collapsed into a single section model rather than a deeply normalized tree.

## Future Roadmap

- None documented in source code today.

## Related Tests

- `apps/extension/test/experienceExtractor.test.js`

