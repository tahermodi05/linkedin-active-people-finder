# Purpose
This investigation evaluates whether the location field can be extracted using only observable evidence from the committed snapshot.

# Location Position
The committed `profile-page.html` snapshot contains the location text `Rajkot, Gujarat, India` in the profile header.

It appears in the profile-information portion of the header, in the same local block as the `Contact info` link.

The location text is positioned before the `Contact info` link within that observable block.

# Nearby Semantic Anchors
- `section[aria-label="Primary content"]`
- The top-card container whose id ends with `Topcard`
- The profile identity link to the member profile
- `h2` for the profile name
- The `Contact info` link with `href="#"`

# Observable Relationships
- The location `Rajkot, Gujarat, India` is inside the profile-information region described in the DOM map.
- The `Contact info` link is in the same observable local block as the location text.
- The profile-information region is inside the top-card boundary identified by the `Topcard` suffix.
- The top-card boundary is inside `section[aria-label="Primary content"]`.

# Candidate Extraction Strategies
1. Read the location from the profile-information region by using the documented `Contact info` link as the nearest semantic anchor and taking the visible location text in the same block.
   - Supporting evidence: the snapshot shows `Rajkot, Gujarat, India` immediately before the `Contact info` link in the same header block.
   - Advantages: uses a documented semantic anchor and stays within the profile-information region.
   - Architectural risks: still requires distinguishing the location text from other adjacent text in the same block without assuming a fixed structure.

2. Read the location from the profile-information region by anchoring on the top-card boundary and scanning only the observable profile-information content inside that boundary.
   - Supporting evidence: the snapshot places the location inside the top-card region beneath `section[aria-label="Primary content"]`.
   - Advantages: keeps the search bounded to the committed profile header area.
   - Architectural risks: broad region scanning is less precise than a tighter semantic anchor and can drift toward incidental structure.

3. Read the location as the text node immediately associated with the documented `Contact info` link within the profile-information region.
   - Supporting evidence: the location is directly adjacent to the `Contact info` link in the snapshot.
   - Advantages: uses a relationship explicitly visible in the committed snapshot.
   - Architectural risks: adjacency-based extraction is fragile if other profile-information fields are introduced or reordered in the snapshot.

# Rejected Strategies
- Text-pattern matching is rejected because it would infer field boundaries from the text itself rather than from documented semantic evidence.
- Geographic heuristics are rejected because they would introduce inference about what looks like a place name instead of extracting the observable value.
- Comma detection is rejected because punctuation is not a semantic anchor and would depend on formatting conventions rather than the committed DOM structure.
- Sibling-order assumptions are rejected because the DOM map identifies sibling-order dependence as a weak signal rather than a durable contract.
- Anonymous container traversal is rejected because the DOM map explicitly treats generic `div` traversal as weak and non-semantic.
- "Everything else" matching is rejected because it would define location by exclusion rather than by a documented anchor or observable region.

# Conclusion
NOT READY FOR IMPLEMENTATION
