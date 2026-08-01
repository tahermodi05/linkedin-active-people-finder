# Purpose
This document describes the observable DOM structure of the committed `profile-page.html` snapshot.

It is not a product document.
It is not an implementation guide.
It is an engineering reference used to design extractors against the snapshot as committed.

# Page Hierarchy
Document

└── Main content

    └── Profile header
        ├── Identity
        ├── Profile information
        └── Social signals

The committed snapshot contains a profile header region near the top of the document. Additional page content appears below that region.

# Region Inventory

## Profile header
- Purpose: Contains the profile identity, profile information, and social-signals content visible in the committed snapshot.
- Observable semantic anchors: `section[aria-label="Primary content"]`, the top card container with the `Topcard` suffix, the profile link, the contact-info link, and the mutual-connections link.
- Candidate Anchors: `section[aria-label="Primary content"]`, `[id$="Topcard"]`, `a[href^="https://www.linkedin.com/in/"]`, `a[href="#"]`, `a[target="_blank"]`.
- Elements that appear unique: The committed snapshot contains a single profile name heading in the observable header area, a single profile identity link, a single contact-info link, a single social-signals block with followers and connections, and a single mutual-connections link.
- Known risks: The snapshot does not label every header subsection with a dedicated semantic wrapper.

## Identity
- Purpose: Contains the member name and headline within the profile header.
- Observable semantic anchors: the profile link, the `h2` name heading, and the text container associated with the headline text.
- Candidate Anchors: `a[href^="https://www.linkedin.com/in/"]`, `h2`, and the text container associated with the headline.
- Elements that appear unique: The committed snapshot contains a single `h2` in the observable identity area.
- Known risks: The snapshot does not expose a dedicated semantic attribute for the headline container.

## Profile information
- Purpose: Contains supporting profile metadata such as company, location, and contact entry point.
- Observable semantic anchors: the `Contact info` link, the location text, and the company text within the same observable header region.
- Candidate Anchors: `a[href="#"]` with visible text `Contact info`, text nodes for location and company within the same local region.
- Elements that appear unique: The committed snapshot contains a single contact-info link in the header area.
- Known risks: The company and location share a common ancestor region rather than a dedicated labeled block.

## Social signals
- Purpose: Contains follower count, connection count, and mutual-connection context.
- Observable semantic anchors: the followers text, the connections label, and the outbound mutual-connections link.
- Candidate Anchors: the social-signal block containing a follower-count text node, the `connections` label, and `a[target="_blank"]`.
- Elements that appear unique: The committed snapshot contains one follower-count text node, one connections label, and one mutual-connections link in the social-signals region.
- Known risks: The snapshot uses repeated text nodes and nested inline elements rather than a dedicated semantic container for the social-signals region.

# Semantic Anchors

- `section[aria-label="Primary content"]`
- The top-card container whose id ends with `Topcard`
- The profile identity link to the member profile
- `h2` for the profile name
- The `Contact info` link with `href="#"`
- The outbound mutual-connections link with `target="_blank"`
- The follower-count text node in the social signals area
- The `connections` label in the social signals area

These anchors are meaningful because they correspond to observable product structure in the committed snapshot rather than incidental layout artifacts.

# Observed Relationships

- The profile name is contained within the identity link and shares a common ancestor with the member photo area.
- The headline text is present in the observable identity area near the name heading.
- The company text and location text reside within the same profile-information region.
- The `Contact info` link resides within the profile-information region.
- The follower count, connection count, and mutual-connections link reside within the same social-signals region.
- The mutual-connections text is rendered as a link.
- The profile header region appears before the rest of the page body content.

# Weak Signals

- Generic `section` traversal inside the profile header.
- Generic `div` traversal inside the top card.
- Sibling assumptions between text nodes or rows.
- Repeated paragraph scanning within a broad container.
- Text-order assumptions across adjacent profile-info fields.

These signals are weak because they depend on incidental structure rather than an explicitly meaningful anchor in the snapshot.

# Rejected Approaches

- Deep anonymous `div` traversal: rejected because the snapshot uses many nested anonymous containers and the path is not semantically meaningful.
- Fixed child indexes: rejected because the snapshot structure is too sensitive to ordering changes.
- Profile-specific assumptions: rejected because they bind behavior to one profile instance instead of the reusable snapshot shape.
- Generated class dependence: rejected because the classes are not stable semantic identifiers.
- Layout-only traversal: rejected because visual grouping alone does not provide durable structure for extractor design.

# Known Unknowns

- Headline grouping: the snapshot contains the headline text, but there is no dedicated semantic attribute marking the headline container.
- Company grouping: the snapshot contains the company text, but the observable region is not labeled with a dedicated field marker.
- Location grouping: the snapshot contains the location text, but the observable region is not labeled with a dedicated field marker.
- Social-signal substructure: the snapshot contains the signal texts, but the internal grouping is not labeled with a separate semantic section attribute.

These are unknowns in the sense that the snapshot does not currently expose a stronger semantic boundary for them than the surrounding observable structure.

# Confidence Levels

| Observation | Confidence |
| --- | --- |
| Primary content region | High |
| Topcard id suffix | High |
| Profile identity link | High |
| Contact info link | High |
| Mutual-connections link | High |
| Profile name heading | Medium |
| Headline grouping | Low |
| Company grouping | Low |
| Location grouping | Low |
| Social-signal grouping | Low |

# Engineering Notes

The committed snapshot contains a usable profile header region, but the semantic density varies across its subregions.

Strong semantic anchors are sparse.

Observed extraction work should begin from the highest-confidence anchors in the snapshot.

Traversal should be minimized once an observable region has been identified.

Unknown structure should not be inferred.

Future extractors should document assumptions explicitly.
