# Purpose
This investigation evaluates whether the headline can be extracted using only documented semantic evidence from the committed snapshot.

# Headline Location
The committed `profile-page.html` snapshot contains the headline text `Senior Graphic Designer` inside the identity area of the profile header.

In the snapshot, the headline appears immediately after the visible name `Sujal Jajal` within the same profile identity link.

The headline is also inside the top-card region that follows `section[aria-label="Primary content"]` and the top-card container whose id ends with `Topcard`.

# Nearby Semantic Anchors
- `section[aria-label="Primary content"]`
- The top-card container whose id ends with `Topcard`
- The profile identity link to the member profile
- `h2` for the profile name

# Observable Relationships
- The profile name `Sujal Jajal` and the headline `Senior Graphic Designer` appear in the same identity block in the committed snapshot.
- The profile name is wrapped by the profile identity link.
- The headline text appears after the profile name within that same link.
- The identity block is contained within the top-card region.
- The top-card region is contained within `section[aria-label="Primary content"]`.

# Candidate Extraction Strategies
1. Use the documented profile identity link as the containing region and read the headline text from the same identity block.
   - Evidence: the snapshot shows the name and headline together inside the profile identity link.
   - Advantages: stays close to a documented semantic anchor and uses observable sibling text in the committed snapshot.
   - Architectural risks: depends on the identity block continuing to expose headline text in the same local region.

2. Use the documented `h2` name heading as the identity anchor and inspect the adjacent text inside the same identity area.
   - Evidence: the snapshot contains a single `h2` in the identity area and the headline is adjacent to it in the same block.
   - Advantages: uses a documented semantic anchor that is already named in the DOM map.
   - Architectural risks: requires separating headline text from surrounding identity content without relying on weaker structural assumptions.

3. Use the top-card boundary and derive the headline from the observable identity subsection within that boundary.
   - Evidence: the headline is visibly inside the top-card region and the DOM map identifies the top-card boundary as a semantic anchor.
   - Advantages: keeps traversal within the documented profile header region.
   - Architectural risks: broad region traversal is less precise than anchoring on the identity link and may drift toward incidental structure.

# Rejected Strategies
- Deep anonymous `div` traversal is rejected because the DOM map explicitly treats generic `div` traversal as a weak signal, not a documented anchor.
- Fixed child-index selection is rejected because the DOM map identifies layout-sensitive traversal as a rejected approach.
- Generated class-based selection is rejected because the DOM map does not treat generated classes as semantic anchors.
- Profile-specific assumptions are rejected because the snapshot must be treated as a reusable contract, not a one-off profile instance.
- Any strategy that infers a headline value from visual arrangement alone is rejected because the extraction philosophy forbids inference.

# Conclusion
NOT READY FOR IMPLEMENTATION
