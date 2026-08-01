# Purpose
The Profile Header extractor is responsible for reading profile header information from the committed LinkedIn snapshot and returning that information in a structured form.

It extracts only header information.
It does not perform scoring.
It does not perform inference.
It does not perform enrichment.

# Responsibilities

- `profileUrl`: The canonical profile URL for the person represented by the snapshot.
- `fullName`: The visible person name in the profile header.
- `headline`: The visible professional headline associated with the profile header.
- `location`: The visible location value associated with the profile header.
- `currentCompany`: The visible current company value associated with the profile header.

These fields describe the observable header-level identity and profile-information content only.

# Non-Responsibilities

This extractor must never own:

- activity
- career history
- ranking
- lead scoring
- engagement signals
- inferred seniority
- inferred department
- experience
- education
- skills
- post data
- interaction data

# Input Contract
The extractor operates on a single DOM region representing the profile header in the committed snapshot.

The input is expected to be the header region only, not the full page as a product concept.

# Output Contract
The extractor returns a structured object containing the owned profile header fields.

Unknown values are returned as `null`.

No guessing is allowed.

No placeholder values are allowed.

# Eligible Anchors

The extractor may rely only on anchors already documented in [`docs/architecture/profile-page-dom-map.md`](/Users/tahermodi/Developer/linkedin-active-people-finder/docs/architecture/profile-page-dom-map.md).

These include:

- the `Primary content` region
- the top-card boundary identified by the `Topcard` suffix
- the profile identity link
- the `h2` name heading
- the `Contact info` link
- the mutual-connections link
- the follower-count text node in the social-signals area
- the `connections` label in the social-signals area

# Allowed Assumptions

- documented observable relationships
- shared observable regions
- semantic anchors
- the committed snapshot reflects the current contract for the extractor

# Forbidden Assumptions

- fixed child indexes
- generated classes
- profile-specific values
- layout-only traversal
- inferred meaning
- inferred business data
- unseen DOM structure
- values from outside the committed snapshot

# Null Policy

Return `null` when a field cannot be identified with confidence from the documented anchors and observable snapshot structure.

Return `null` when the relevant region is absent.

Return `null` when the field cannot be separated from surrounding content without relying on forbidden assumptions.

Returning `null` is preferred over returning incorrect data.

# Validation Checklist

- follows extraction philosophy
- deterministic output
- no inference
- no scoring
- uses documented anchors
- verified against committed snapshot
