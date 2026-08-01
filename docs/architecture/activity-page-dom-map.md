# Purpose
This document describes the observable DOM structure of the committed activity snapshot.

It is an engineering reference only.

# Page Hierarchy
Document

└── Placeholder snapshot

The committed `docs/html-snapshots/company-people.html` file currently contains a placeholder comment instead of a real LinkedIn activity snapshot.

No observable activity region is present in the committed HTML at this time.

# Region Inventory

## Placeholder snapshot
- Purpose: Marks the location where a real committed activity snapshot is expected to live.
- Observable anchors: none.
- Candidate anchors: none.
- Unique elements: a placeholder comment indicating that a real snapshot should be committed before selector work begins.
- Known risks: no real DOM structure is available, so no activity extractor can be grounded in committed evidence yet.

# Semantic Anchors

No observable semantic anchors are present in the committed activity snapshot because the committed file is only a placeholder comment.

# Observable Relationships

No observable DOM relationships can be described from the committed activity snapshot because there is no real activity DOM in the file.

# Repeated Structures

No repeated activity-item structures are present in the committed activity snapshot.

# Weak Signals

No weak signals can be identified from the committed activity snapshot because there is no observable activity structure to analyze.

# Rejected Approaches

- Inferring activity structure from the placeholder comment is rejected because it would violate the extraction philosophy.
- Treating the placeholder file as if it contained real activity DOM is rejected because it would invent evidence that is not present in the committed snapshot.
- Designing selectors without a committed snapshot is rejected because there are no observable anchors to validate against.

# Known Unknowns

- The real activity-page DOM has not yet been committed.
- No observable activity feed, activity cards, or activity metadata are available in the repository snapshot.
- No semantic anchors can be identified until a real snapshot replaces the placeholder.

# Confidence Levels

| Observation | Confidence |
| --- | --- |
| `company-people.html` is a placeholder comment | High |
| Real activity DOM is absent from the committed file | High |
| Activity-region anchors are unavailable | High |
| Activity-item repetition is unavailable | High |
| Future activity structure is unknown | High |

# Engineering Notes

This DOM map establishes that the repository does not yet contain a committed activity snapshot to analyze.

Future extractor design for Activity Intelligence must wait for a real snapshot with observable anchors, repeated item structure, and documented regions before any activity-specific selector work can be grounded in evidence.
