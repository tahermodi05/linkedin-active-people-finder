# Activity Content Extraction Investigation

Source of truth:

- `docs/html-snapshots/activity-page.html`
- `docs/architecture/activity-post-dom-map.md`

Scope: the visible text content of the first observable Activity article matching `article[data-urn^="urn:li:activity:"]`.

This note evaluates whether the article’s visible text content can be extracted using stable observable anchors. It does not define or implement an extractor.

## Observable Content Region

The visible text content sits in the commentary region directly below the author block and above the media block.

Observed structure in the snapshot:

- `.feed-shared-inline-show-more-text`
- `.update-components-text`
- `.update-components-update-v2__commentary`
- nested `span` wrappers that contain the rendered text
- inline `a` elements for hashtags
- a `button[aria-label^="see more"]` for collapsed overflow content

This region is visually distinct and separated from the author, media, engagement, and action regions described in the DOM map.

## Candidate Semantic Anchors

| Candidate selector | Confidence | Notes |
| --- | --- | --- |
| `article[data-urn^="urn:li:activity:"]` | HIGH | Stable root anchor for the article. |
| `.feed-shared-inline-show-more-text` | HIGH | Primary observable wrapper for the visible post text. |
| `.update-components-text` | HIGH | Semantic text container inside the commentary region. |
| `.update-components-update-v2__commentary` | HIGH | Direct commentary region class. |
| `button[aria-label^="see more"]` | HIGH | Stable control for truncated content in this snapshot. |
| `.feed-shared-update-v2__description` | MEDIUM | Description wrapper is observable, but more layout-oriented than the commentary-specific classes. |

## Repeated Patterns

The snapshot shows repeated, structurally consistent patterns inside the content region:

- Text is wrapped in nested `span` elements rather than a single flat text node.
- Line breaks are represented by repeated `<br>` nodes.
- Hashtags are rendered as inline anchors with `href` values pointing to LinkedIn search URLs.
- Long text is paired with a visible `see more` button.

These repeated patterns are helpful for extraction because they consistently appear in the visible commentary area rather than being shared across unrelated regions.

## Extraction Risks

The content is extractable, but the implementation must account for these risks:

- Nested `span` wrappers can make naive `textContent` reads include unwanted whitespace or collapse structure differently than expected.
- The visible text may be truncated in the DOM and require handling of the `see more` control if the goal is the full rendered text.
- Hashtag links are part of the visible text region and may need to be preserved or normalized depending on downstream expectations.
- Content could vary across articles in how much is collapsed, but the commentary anchor structure itself is stable in this snapshot.

## Rejected Approaches

Do not rely on:

- Generated class names such as `XQidInOZdUqrHGlQkkUpVUZDTyqjTPrnrE`.
- Fixed positional traversal like `article > div > div > div:nth-child(...)`.
- Anonymous `div` walks without a stable semantic anchor.
- Layout-only assumptions about the text being the first or only block under the article.

## Engineering Recommendation

The visible text content can be extracted using stable observable anchors.

Recommended anchor strategy:

- Start from `article[data-urn^="urn:li:activity:"]`.
- Narrow to `.update-components-update-v2__commentary` or `.update-components-text`.
- Treat `.feed-shared-inline-show-more-text` as the outer content wrapper.
- Preserve inline link text for hashtags and normalize whitespace after extraction.
- Use the `see more` button only as an observable indicator that the text region may be truncated, not as a selector dependency.

The commentary region is sufficiently stable in this snapshot to support implementation.

## Conclusion

READY FOR IMPLEMENTATION
