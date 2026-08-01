# Purpose
Activity Intelligence defines how Veriq detects observable engagement signals from a LinkedIn profile.

It extracts observable signals only.

No scoring.

No ranking.

No lead qualification.

# Responsibilities
Activity Intelligence may own directly observable signals that describe whether and how a profile exposes public activity-related content.

These include:
- activity availability
- recent posts
- posting cadence
- engagement visibility
- repost visibility
- article visibility

Each owned signal must come from committed snapshot evidence and must remain observable rather than inferred.

# Non-Responsibilities
Activity Intelligence explicitly does not own:
- lead scoring
- engagement quality
- buying intent
- influence scoring
- sales recommendations
- ranking
- AI inference

These are downstream or inferential concerns and are outside the scope of observable signal extraction.

# Candidate Extractors
Proposed extractors for Activity Intelligence include:
- `activityAvailability.js`
- `recentPosts.js`
- `repostSignals.js`
- `articleSignals.js`

These names describe signal categories only and do not prescribe implementation details.

# Signal Contracts
Each extractor owns a single category of observable signals.

That ownership should remain narrow, explicit, and directly tied to committed snapshot evidence.

Signal contracts should describe what is observable, what is absent, and when the result must remain null.

# Extraction Philosophy
Activity Intelligence follows exactly the same architectural rules as the existing extraction philosophy.

It relies on committed snapshot evidence, rejects inference, and treats null as the correct result when a signal cannot be observed with confidence.

# Engineering Notes
Activity Intelligence extractors must remain independent from downstream scoring.

This separation preserves the boundary between observable signal extraction and any later consumption, qualification, or prioritization layer.
