# Purpose
This investigation evaluates whether the current company can be extracted using only observable evidence from the committed snapshot.

# Company Position
The committed `profile-page.html` snapshot contains the company value `Infoiconic` in the profile header.

It appears in the profile-information portion of the header, alongside the location text and the `Contact info` link.

The company value appears before the location text and before the `Contact info` link within that observable block.

# Nearby Semantic Anchors
- `section[aria-label="Primary content"]`
- The top-card container whose id ends with `Topcard`
- The profile identity link to the member profile
- `h2` for the profile name
- The `Contact info` link with `href="#"`

# Observable Relationships
- The company value `Infoiconic` is inside the profile-information region described in the DOM map.
- The company value is in the same observable block as the location text `Rajkot, Gujarat, India` and the `Contact info` link.
- The profile-information region is inside the top-card boundary identified by the `Topcard` suffix.
- The top-card boundary is inside `section[aria-label="Primary content"]`.

# Candidate Extraction Strategies
1. Read the company value from the profile-information region by using the documented `Contact info` link as the nearest semantic anchor and taking the visible company text in the same block.
   - Supporting evidence: the snapshot shows `Infoiconic` immediately before the location text and the `Contact info` link in the same header block.
   - Advantages: stays within a documented semantic region and uses a documented anchor already present in the DOM map.
   - Architectural risks: still depends on separating the company text from adjacent profile-information text without relying on fixed structure.

2. Read the company value from the profile-information region by anchoring on the top-card boundary and scanning only the observable profile-information content inside that boundary.
   - Supporting evidence: the snapshot places the company inside the top-card region beneath `section[aria-label="Primary content"]`.
   - Advantages: bounded to the committed profile header area and does not require page-wide traversal.
   - Architectural risks: broad region scanning is weaker than a direct semantic anchor and can drift toward incidental structure.

3. Read the company value as the text node immediately associated with the documented profile-information block around the `Contact info` link.
   - Supporting evidence: the company text is directly adjacent to the location and contact-info elements in the committed snapshot.
   - Advantages: uses an observable local relationship visible in the snapshot.
   - Architectural risks: adjacency-based extraction is fragile if the profile-information block gains additional text or changes ordering.

# Rejected Strategies
- Text heuristics are rejected because they would infer company meaning from the text itself rather than from documented semantic evidence.
- "Remaining text" matching is rejected because it would define the company by excluding other fields, not by identifying the company value directly.
- Sibling-order assumptions are rejected because the DOM map treats sibling-order dependence as a weak signal rather than a durable contract.
- Anonymous container traversal is rejected because the DOM map explicitly treats generic `div` traversal as weak and non-semantic.
- Generated classes are rejected because the DOM map does not treat generated classes as stable semantic anchors.
- Inferred employment meaning is rejected because the extraction philosophy forbids inference and only allows observable evidence from the committed snapshot.

# Conclusion
NOT READY FOR IMPLEMENTATION
