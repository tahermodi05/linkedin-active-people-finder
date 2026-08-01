# Veriq Engineering Playbook

This document is the engineering handbook for Veriq. It is intended for engineers joining the project and should be treated as the single source of truth for how the codebase is organized, how extraction work is done, and how new work should be evaluated.

This playbook does not invent architecture. It summarizes the architecture already implemented and documented in the repository and cross-references the source documents that define each part of the system.

## 1. Project Vision

Veriq is an observable-evidence extraction system for LinkedIn pages.

The project exists to read committed HTML snapshots and extract only what can be supported by stable observable evidence.

The architecture favors:

- deterministic extraction
- snapshot-backed contracts
- narrow, explicit responsibilities
- conservative null handling when evidence is insufficient

The vision is not to infer hidden meaning. It is to build a dependable extraction system around evidence that is visible in committed snapshots.

## 2. Product Mission

Veriq’s product mission is to turn observable LinkedIn page structure into structured data that can support downstream workflows.

Today, that means:

- extracting profile-header fields
- extracting activity availability
- extracting recent activity posts
- extracting activity post content
- classifying activity posts conservatively when evidence supports it
- composing those pieces into an activity intelligence pipeline

For the Activity work, see:

- [Activity Intelligence design](/Users/tahermodi/Developer/linkedin-active-people-finder/docs/architecture/activity-intelligence-design.md)
- [Activity post DOM map](/Users/tahermodi/Developer/linkedin-active-people-finder/docs/architecture/activity-post-dom-map.md)
- [Activity content investigation](/Users/tahermodi/Developer/linkedin-active-people-finder/docs/architecture/activity-content-investigation.md)
- [Extraction philosophy](/Users/tahermodi/Developer/linkedin-active-people-finder/docs/architecture/extraction-philosophy.md)

## 3. Long-Term Roadmap

The long-term roadmap is intentionally conservative and evidence-driven.

The existing documentation suggests a path of incremental extraction growth:

- profile header extraction and gap closure
- activity signal extraction
- activity content extraction
- activity post type classification
- activity intelligence composition
- manual snapshot capture for new evidence

The repository does not define a broad product platform beyond these layers. The practical roadmap is to keep adding evidence-backed extraction capabilities only when the committed snapshot set and investigations justify them.

Relevant references:

- [Profile header design](/Users/tahermodi/Developer/linkedin-active-people-finder/docs/architecture/profile-header-design.md)
- [Profile header gap analysis](/Users/tahermodi/Developer/linkedin-active-people-finder/docs/architecture/profile-header-gap-analysis.md)
- [Activity snapshot capture](/Users/tahermodi/Developer/linkedin-active-people-finder/docs/architecture/activity-snapshot-capture.md)
- [Current company investigation](/Users/tahermodi/Developer/linkedin-active-people-finder/docs/architecture/current-company-investigation.md)
- [Headline investigation](/Users/tahermodi/Developer/linkedin-active-people-finder/docs/architecture/headline-investigation.md)
- [Location investigation](/Users/tahermodi/Developer/linkedin-active-people-finder/docs/architecture/location-investigation.md)

## 4. Collaboration Model

Veriq development is organized around a shared evidence trail.

The collaboration model is:

- document the snapshot and the DOM map
- write an investigation if a selector or field boundary is uncertain
- implement only after the investigation concludes the work is ready
- keep extractors thin and compositional
- validate behavior with committed-snapshot tests

This model allows engineers to reason from the same evidence source rather than from informal assumptions.

The repo’s recent sequence reflects this flow:

- capture or maintain the committed snapshot
- map the observable DOM
- investigate the extraction question
- refine the extraction philosophy if needed
- implement the extractor
- add tests

## 5. Engineering Principles

The engineering principles are already encoded across the architecture docs and tests:

- prefer observable evidence over inference
- keep extraction pure and deterministic
- return `null` or `unknown` instead of guessing
- use the narrowest layer that owns the logic
- keep business calculations out of extractors
- keep orchestration separate from extraction
- preserve committed-snapshot contracts through tests
- avoid runtime integration changes unless explicitly requested

Primary source:

- [Extraction philosophy](/Users/tahermodi/Developer/linkedin-active-people-finder/docs/architecture/extraction-philosophy.md)

## 6. Snapshot-First Development Workflow

The snapshot-first workflow is the standard way to add or refine extraction behavior.

1. Capture or maintain a committed snapshot.
2. Map the observable DOM for the relevant region.
3. Investigate whether the needed field or signal is actually supported by the snapshot.
4. Decide whether the extractor should return a value, `null`, or `unknown`.
5. Implement the smallest possible extractor.
6. Compose the extractor into a higher layer only if the architecture requires it.
7. Add tests against the committed snapshot or a minimal DOM harness.

This workflow is visible in the Activity series:

- [Activity snapshot capture](/Users/tahermodi/Developer/linkedin-active-people-finder/docs/architecture/activity-snapshot-capture.md)
- [Activity page DOM map](/Users/tahermodi/Developer/linkedin-active-people-finder/docs/architecture/activity-page-dom-map.md)
- [Activity post DOM map](/Users/tahermodi/Developer/linkedin-active-people-finder/docs/architecture/activity-post-dom-map.md)
- [Activity content investigation](/Users/tahermodi/Developer/linkedin-active-people-finder/docs/architecture/activity-content-investigation.md)

## 7. Extraction Philosophy

The extraction philosophy is defined in:

- [Extraction philosophy](/Users/tahermodi/Developer/linkedin-active-people-finder/docs/architecture/extraction-philosophy.md)

Key points:

- selectors must be justified by observable evidence
- semantic attributes are preferred
- meaningful HTML elements are preferred over brittle traversal
- stable observable attributes are preferred over weak structure
- documented component classes are allowed only as justified exceptions
- layout traversal is a last resort

The philosophy was refined after Activity content work showed that some committed snapshots expose important regions only through documented component classes. That refinement does not weaken the philosophy; it makes the exception path explicit and reviewable.

## 8. Selector Decision Framework

The selector order of preference is defined in:

- [Extraction philosophy](/Users/tahermodi/Developer/linkedin-active-people-finder/docs/architecture/extraction-philosophy.md)

The framework is:

1. Semantic attributes
   - `aria-*`
   - `role`
   - `data-*`
2. Meaningful HTML elements
3. Stable observable attributes
4. Documented component classes
   - only when documented in a committed snapshot
   - only when repeated consistently
   - only when no stronger observable anchor exists
   - only when explicitly justified in an investigation document
5. Stable structural relationships
6. Layout traversal
   - last resort

For Activity content, the committed snapshot and the investigation document justify the use of documented component classes as an exception, not as a general rule.

Relevant reference:

- [Activity content investigation](/Users/tahermodi/Developer/linkedin-active-people-finder/docs/architecture/activity-content-investigation.md)

## 9. Exception Process

When a component class is used, the implementation or associated architecture note must document:

- why no stronger selector exists
- why the class is considered stable enough
- which investigation document approved it
- what conditions would require reevaluation

This process exists to make exceptions explicit and temporary rather than implicit and permanent.

Relevant reference:

- [Extraction philosophy](/Users/tahermodi/Developer/linkedin-active-people-finder/docs/architecture/extraction-philosophy.md)

## 10. Current Architecture

The current architecture is layered and intentionally small.

### Documented layers

- snapshot capture
- DOM mapping
- investigations
- extractors
- signals
- intelligence composition
- tests
- extension runtime plumbing

### Activity architecture

- `activityAvailability.js` extracts whether activity is observable
- `recentPosts.js` extracts recent activity post elements
- `activityPost.js` composes sub-extractors for a single post
- `activityContent.js` extracts visible post text
- `activityPostType.js` classifies a post conservatively
- `activitySignals.js` builds activity signal summaries
- `activityIntelligence.js` composes the pipeline

### Profile architecture

- `profileHeader.js` extracts supported profile header fields
- unsupported profile header fields remain `null` until evidence justifies more

### Runtime plumbing

- `content.js` handles company people page scanning and snapshot capture messaging
- `background.js` routes extension messages and owns capture/scan orchestration
- `verificationWorker.js` coordinates the profile verification lifecycle
- `popup.js` provides the UI entry point for scan and snapshot capture actions

## 11. Layer Responsibilities

### Snapshot capture

Defined in:

- [Activity snapshot capture](/Users/tahermodi/Developer/linkedin-active-people-finder/docs/architecture/activity-snapshot-capture.md)

Responsibilities:

- serialize the observable page DOM in the page context
- write the HTML into the committed snapshot workflow

### DOM mapping

Defined in:

- [Profile page DOM map](/Users/tahermodi/Developer/linkedin-active-people-finder/docs/architecture/profile-page-dom-map.md)
- [Activity page DOM map](/Users/tahermodi/Developer/linkedin-active-people-finder/docs/architecture/activity-page-dom-map.md)
- [Activity post DOM map](/Users/tahermodi/Developer/linkedin-active-people-finder/docs/architecture/activity-post-dom-map.md)

Responsibilities:

- describe observable structure only
- identify candidate anchors
- classify confidence
- reject brittle approaches

### Investigations

Defined across:

- [Headline investigation](/Users/tahermodi/Developer/linkedin-active-people-finder/docs/architecture/headline-investigation.md)
- [Current company investigation](/Users/tahermodi/Developer/linkedin-active-people-finder/docs/architecture/current-company-investigation.md)
- [Location investigation](/Users/tahermodi/Developer/linkedin-active-people-finder/docs/architecture/location-investigation.md)
- [Activity content investigation](/Users/tahermodi/Developer/linkedin-active-people-finder/docs/architecture/activity-content-investigation.md)

Responsibilities:

- decide readiness
- document risks
- document rejected approaches
- record the evidence basis for implementation

### Extractors

Responsibilities:

- own a single narrow concern
- accept a DOM region or article element
- return a structured object
- avoid business scoring and ranking
- avoid runtime side effects

### Signals

Responsibilities:

- derive only from extracted data
- stay free of DOM queries
- stay free of extraction logic
- stay free of ranking and scoring

### Intelligence composition

Responsibilities:

- orchestrate extractor composition
- return composed domain objects
- own no extraction logic
- own no signal logic

### Tests

Responsibilities:

- validate committed snapshot contracts
- validate deterministic behavior
- validate null or unknown fallbacks
- validate composition boundaries

## 12. Repository Structure

The repository currently organizes Veriq into a small set of clear surfaces.

### Docs

- `docs/html-snapshots/`
- `docs/architecture/`

### Extension

- `apps/extension/extractors/`
- `apps/extension/signals/`
- `apps/extension/intelligence/`
- `apps/extension/test/`
- `apps/extension/shared/`
- `apps/extension/services/`
- `apps/extension/workers/`
- `apps/extension/background.js`
- `apps/extension/content.js`
- `apps/extension/popup.js`

### Snapshot files

- `docs/html-snapshots/profile-page.html`
- `docs/html-snapshots/company-people.html`
- `docs/html-snapshots/activity-page.html`

## 13. Domain Models

The current domain model is intentionally narrow and shaped by extractor ownership.

### Profile header

Defined in:

- [Profile header design](/Users/tahermodi/Developer/linkedin-active-people-finder/docs/architecture/profile-header-design.md)

Supported values:

- `profileUrl`
- `fullName`

Unsupported values remain `null` until the evidence supports them.

### Activity availability

Defined in:

- `activityAvailability.js`
- [Activity Intelligence design](/Users/tahermodi/Developer/linkedin-active-people-finder/docs/architecture/activity-intelligence-design.md)

### Recent posts

Defined in:

- `recentPosts.js`

### Activity post

Current shape:

```js
{
  activityUrn: string | null,
  type: "original" | "repost" | "article" | "unknown",
  content: {
    text: string | null
  }
}
```

Defined by:

- `activityPost.js`
- `activityPostType.js`
- `activityContent.js`

### Activity signals

Current shape:

```js
{
  totalPosts: number,
  hasPosts: boolean,
  validPosts: number
}
```

Defined by:

- `activitySignals.js`

### Activity intelligence

Current shape:

```js
{
  recentPosts,
  signals
}
```

Defined by:

- `activityIntelligence.js`

## 14. Testing Philosophy

Testing follows the same snapshot-first discipline as extraction.

Guidelines:

- validate against committed snapshots where possible
- keep tests focused on a single contract
- verify object shape explicitly
- verify deterministic output
- verify null or unknown fallback behavior
- verify delegation boundaries for composition layers
- avoid tests that depend on runtime integration unless the runtime is the subject of the work

Examples:

- [profileHeader.test.js](/Users/tahermodi/Developer/linkedin-active-people-finder/apps/extension/test/profileHeader.test.js)
- [activityAvailability.test.js](/Users/tahermodi/Developer/linkedin-active-people-finder/apps/extension/test/activityAvailability.test.js)
- [recentPosts.test.js](/Users/tahermodi/Developer/linkedin-active-people-finder/apps/extension/test/recentPosts.test.js)
- [activityContent.test.js](/Users/tahermodi/Developer/linkedin-active-people-finder/apps/extension/test/activityContent.test.js)
- [activityPostType.test.js](/Users/tahermodi/Developer/linkedin-active-people-finder/apps/extension/test/activityPostType.test.js)
- [activityPost.test.js](/Users/tahermodi/Developer/linkedin-active-people-finder/apps/extension/test/activityPost.test.js)
- [activityIntelligence.test.js](/Users/tahermodi/Developer/linkedin-active-people-finder/apps/extension/test/activityIntelligence.test.js)

## 15. Current Completed Milestones

The repo history shows the current completed milestones for the Activity stack and supporting philosophy.

### Snapshot and platform foundation

- simplified Activity snapshot capture
- added the profile header contract and activity snapshot test support

### Activity extraction stack

- added the activity availability extractor
- added the recent posts extractor
- added the activity post extractor
- added the activity signals layer
- added the activity intelligence pipeline
- added the activity content investigation
- added the activity content extractor
- added the activity post type extractor

### Architecture documentation

- added the Activity page DOM map
- added the Activity post DOM map
- refined the extraction philosophy
- added the Activity content investigation
- added the engineering playbook

Source references:

- [git log](/Users/tahermodi/Developer/linkedin-active-people-finder)
- [Activity page DOM map](/Users/tahermodi/Developer/linkedin-active-people-finder/docs/architecture/activity-page-dom-map.md)
- [Activity post DOM map](/Users/tahermodi/Developer/linkedin-active-people-finder/docs/architecture/activity-post-dom-map.md)
- [Extraction philosophy](/Users/tahermodi/Developer/linkedin-active-people-finder/docs/architecture/extraction-philosophy.md)

## 16. Current Roadmap

The current roadmap is the set of documented gaps and next evidence-backed opportunities already present in the repo.

### Supported now

- profile URL
- full name
- activity availability
- recent posts
- activity post content
- conservative activity post type classification
- activity signals
- activity intelligence composition

### Documented gaps

The profile header investigations explicitly state that these remain unsupported under the current evidence set:

- headline
- location
- current company

See:

- [Profile header gap analysis](/Users/tahermodi/Developer/linkedin-active-people-finder/docs/architecture/profile-header-gap-analysis.md)
- [Headline investigation](/Users/tahermodi/Developer/linkedin-active-people-finder/docs/architecture/headline-investigation.md)
- [Location investigation](/Users/tahermodi/Developer/linkedin-active-people-finder/docs/architecture/location-investigation.md)
- [Current company investigation](/Users/tahermodi/Developer/linkedin-active-people-finder/docs/architecture/current-company-investigation.md)

### Likely next evidence-backed work

- additional profile-header fields only if new evidence supports them
- broader activity classification only if committed snapshots expose stronger observable anchors
- continued documentation of investigation outcomes before implementation

This roadmap is intentionally bounded by evidence already captured in the repository.

## 17. Lessons Learned

The current repo history and Activity work produced a few durable lessons:

- some important regions are not always exposed through semantic attributes
- component classes can be acceptable only when a committed snapshot and investigation explicitly justify them
- extractor composition must stay separate from extraction logic
- null and unknown are valid engineering outcomes
- a thin orchestration layer is easier to reason about than monolithic extraction logic
- tests should verify both behavior and shape, not just truthiness

These lessons are reflected in:

- [Extraction philosophy](/Users/tahermodi/Developer/linkedin-active-people-finder/docs/architecture/extraction-philosophy.md)
- [Activity content investigation](/Users/tahermodi/Developer/linkedin-active-people-finder/docs/architecture/activity-content-investigation.md)
- [Activity post DOM map](/Users/tahermodi/Developer/linkedin-active-people-finder/docs/architecture/activity-post-dom-map.md)

## 18. Architecture Decision Log

This is a compact decision log of the architecture choices already made in the repository.

### Decision: Use committed snapshots as the evidence source

Why:

- the repo’s extractors and investigations are all based on committed HTML snapshots

Reference:

- [Activity snapshot capture](/Users/tahermodi/Developer/linkedin-active-people-finder/docs/architecture/activity-snapshot-capture.md)

### Decision: Separate DOM maps from extractors

Why:

- DOM maps describe observable structure
- extractors own implementation
- investigations bridge the gap between them

References:

- [Profile page DOM map](/Users/tahermodi/Developer/linkedin-active-people-finder/docs/architecture/profile-page-dom-map.md)
- [Activity page DOM map](/Users/tahermodi/Developer/linkedin-active-people-finder/docs/architecture/activity-page-dom-map.md)
- [Activity post DOM map](/Users/tahermodi/Developer/linkedin-active-people-finder/docs/architecture/activity-post-dom-map.md)

### Decision: Keep extraction conservative

Why:

- unsupported fields should return `null`
- unsupported types should return `unknown`

References:

- [Profile header gap analysis](/Users/tahermodi/Developer/linkedin-active-people-finder/docs/architecture/profile-header-gap-analysis.md)
- [Activity post type extraction test](/Users/tahermodi/Developer/linkedin-active-people-finder/apps/extension/test/activityPostType.test.js)

### Decision: Allow documented component class exceptions

Why:

- the Activity content investigation showed that some committed snapshots require them

References:

- [Extraction philosophy](/Users/tahermodi/Developer/linkedin-active-people-finder/docs/architecture/extraction-philosophy.md)
- [Activity content investigation](/Users/tahermodi/Developer/linkedin-active-people-finder/docs/architecture/activity-content-investigation.md)

### Decision: Keep intelligence as orchestration only

Why:

- `activityIntelligence.js` composes `recentPosts` and `activitySignals`
- it owns no extraction logic and no signal logic

Reference:

- [Activity Intelligence design](/Users/tahermodi/Developer/linkedin-active-people-finder/docs/architecture/activity-intelligence-design.md)

## 19. Future Engineering Guidelines

When adding new work, follow these rules:

- start with a committed snapshot or a documented investigation
- do not add selectors without evidence
- prefer semantic anchors first
- use documented component classes only through the exception process
- keep each extractor narrow
- keep signal logic separate from extraction logic
- keep orchestration separate from both
- update tests when the domain model changes
- update architecture docs when selector decisions change
- do not add runtime integration unless the task explicitly asks for it

If a future field or type cannot be grounded in the committed snapshot, the correct implementation is to return `null` or `unknown` and document why.

That discipline is what keeps Veriq stable as the snapshot set grows.
