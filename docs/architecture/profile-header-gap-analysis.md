# Purpose
This document summarizes why several profile-header fields cannot currently be extracted under Veriq's extraction philosophy.

# Supported Fields
- `profileUrl`
- `fullName`

These fields are considered sufficiently supported because the extractor already has committed-snapshot evidence and a public contract for them, and the existing test coverage validates that contract against the committed HTML snapshot.

# Unsupported Fields
## headline
- Observable evidence: the committed snapshot contains the headline text `Senior Graphic Designer` in the identity area.
- Strongest documented anchors: `section[aria-label="Primary content"]`, the top-card container whose id ends with `Topcard`, the profile identity link to the member profile, `h2` for the profile name.
- Architectural blocker: the investigations conclude the snapshot does not provide a strong enough semantic boundary for headline extraction without relying on weak structure-sensitive assumptions.

## location
- Observable evidence: the committed snapshot contains the location text `Rajkot, Gujarat, India` in the profile header.
- Strongest documented anchors: `section[aria-label="Primary content"]`, the top-card container whose id ends with `Topcard`, the profile identity link to the member profile, `h2` for the profile name, the `Contact info` link with `href="#"`.
- Architectural blocker: the investigations show the location is only supported by adjacency within the profile-information block, which is not yet a sufficiently strong contract.

## currentCompany
- Observable evidence: the committed snapshot contains the company value `Infoiconic` in the profile header.
- Strongest documented anchors: `section[aria-label="Primary content"]`, the top-card container whose id ends with `Topcard`, the profile identity link to the member profile, `h2` for the profile name, the `Contact info` link with `href="#"`.
- Architectural blocker: the investigations show the company value is embedded in the same profile-information block as other fields, so extraction would depend on structure-sensitive separation that is not yet justified.

# Common Architectural Gaps
- Insufficient semantic boundaries within the profile-information and identity areas.
- Dependence on adjacent or anonymous content rather than uniquely named field anchors.
- Lack of a durable, field-specific observable contract for unsupported fields.
- Reliance on weak signals such as sibling order and local text adjacency.
- Absence of stronger evidence that would separate field values from surrounding header content without inference.

# Required Evidence Before Implementation
- Additional committed snapshots showing the same field boundaries across multiple profile headers.
- Repeated observable DOM patterns across multiple profiles that isolate each field more clearly.
- Newly introduced semantic attributes or other durable anchors that explicitly identify the unsupported fields.
- Stronger snapshot evidence that the fields can be separated from surrounding header content without relying on adjacency or incidental ordering.

# Engineering Decision
The current implementation intentionally returns null for unsupported fields because doing so is more correct than introducing structure-sensitive extraction.

# Conclusion
The current status of the Profile Header extractor is that `profileUrl` and `fullName` are supported, while `headline`, `location`, and `currentCompany` remain unsupported under the current evidence set.

The extractor is considered complete for the current evidence set.
