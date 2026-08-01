# Activity Post DOM Map

Source of truth: `docs/html-snapshots/activity-page.html`

Scope: the first observable Activity article matching:

```css
article[data-urn^="urn:li:activity:"]
```

This document describes only the observable DOM structure inside one Activity article. It does not infer business meaning, does not define extraction logic, and does not rely on generated classes, fixed indexes, or anonymous `div` traversal.

## Top-Level Anchor

| Candidate selector | Confidence | Notes |
| --- | --- | --- |
| `article[data-urn^="urn:li:activity:"]` | HIGH | Stable article anchor for an observable Activity item. Contains the `data-urn` identity. |
| `[role="article"][data-urn^="urn:li:activity:"]` | HIGH | Same anchor with explicit semantics. |
| `[data-urn^="urn:li:activity:"]` | HIGH | Unique attribute anchor present on the article root. |

## Observable Regions

### 1. Author Region

Observable subtree near the top of the article, containing avatar, author metadata, service link, timestamp, and control menu.

| Candidate selector | Confidence | Notes |
| --- | --- | --- |
| `.update-components-actor__container` | HIGH | Clear author container class used for the author region. |
| `.update-components-actor__image` | HIGH | Author avatar/profile link. |
| `.update-components-actor__meta-link` | HIGH | Author name and metadata link. |
| `.update-components-actor__title` | HIGH | Primary author title/text container. |
| `.update-components-actor__description` | HIGH | Secondary author description text container. |
| `.update-components-actor__sub-description` | HIGH | Timestamp and visibility metadata container. |
| `button[aria-label^="Open control menu for post by "]` | HIGH | Observable control-menu button with stable accessible label prefix. |
| `[aria-label="Control Menu Options"]` | MEDIUM | Menu container is observable, but may depend on menu state. |

Observable anchors and attributes:

- `role="article"` on the root article.
- `data-urn="urn:li:activity:..."` on the root article.
- `aria-label` on the profile image link.
- `aria-label` on the author meta link.
- `aria-label` on the control menu button.
- `target="_self"` on the profile/service links.
- `href` on the author/profile links.

### 2. Text Container

Observable commentary text area directly below the author region.

| Candidate selector | Confidence | Notes |
| --- | --- | --- |
| `.feed-shared-inline-show-more-text` | HIGH | Primary text container wrapper. |
| `.update-components-text` | HIGH | Observable text content wrapper. |
| `.update-components-update-v2__commentary` | HIGH | Commentary region class. |
| `button[aria-label^="see more"]` | HIGH | Expand/collapse control for long text. |

Repeated child patterns:

- Nested `span` wrappers around visible commentary text.
- Inline `a` links for hashtags.
- Line-break elements separating text fragments.

Observable links inside the text container:

- Hashtag links with `href` targeting LinkedIn search URLs.

### 3. Media Container

Observable image content area beneath the text container.

| Candidate selector | Confidence | Notes |
| --- | --- | --- |
| `.update-components-image` | HIGH | Outer media region. |
| `.update-components-image__container` | HIGH | Media container with visible padding style. |
| `.update-components-image__image-link` | HIGH | Clickable media activation button. |
| `img[alt="View image"]` | HIGH | Observable image element with a stable alt text in the snapshot. |

Observable attributes:

- `type="button"` on the image activation control.
- `alt="View image"` on the media image.
- `loading="lazy"` on the media image.

### 4. Engagement Region

Observable social counts area below media content.

| Candidate selector | Confidence | Notes |
| --- | --- | --- |
| `.update-v2-social-activity` | HIGH | Outer engagement container. |
| `.social-details-social-counts` | HIGH | Social count wrapper. |
| `.social-details-social-counts__reactions` | HIGH | Reactions region. |
| `.social-details-social-counts__comments` | HIGH | Comments region. |
| `.social-details-social-counts__item--truncate-text` | MEDIUM | Repost count region, but the class is more layout-oriented than semantic. |
| `button[data-reaction-details]` | HIGH | Reactions count button. |
| `button[aria-label$="comments on Mansi Jain’s post"]` | MEDIUM | Observable in the snapshot, but the author name in the label is content-dependent. |
| `button[aria-label$="reposts of Mansi Jain’s post"]` | MEDIUM | Same caveat as comments. |

Observable content:

- Reactions count button with nested reaction icons.
- Comments count button.
- Reposts count button.

Repeated child regions:

- A `ul` containing count items.
- Each count item is represented by a `li`.
- Each count item contains a `button`.

### 5. Action Region

Observable social action bar beneath engagement counts.

| Candidate selector | Confidence | Notes |
| --- | --- | --- |
| `.feed-shared-social-action-bar` | HIGH | Primary action bar container. |
| `.social-actions-button.react-button__trigger` | HIGH | Like/react action button. |
| `button[aria-label="Open reactions menu"]` | HIGH | Reaction menu trigger. |
| `button[aria-label="Comment"]` | HIGH | Comment action button. |
| `button[aria-label="Send in a private message"]` | HIGH | Send/share action button. |
| `.social-reshare-button` | HIGH | Repost/share action region. |

Observable buttons:

- React Like button.
- Open reactions menu button.
- Comment button.
- Repost button.
- Send button.

Observable attributes:

- `aria-pressed` on the Like button.
- `aria-expanded` on menu-trigger buttons.
- `data-finite-scroll-hotkey` on action buttons.

## Repeated Child Regions

The first article shows the same structural pattern repeated in a few places:

- Root article element with a stable `data-urn`.
- Author region built from avatar, metadata, and control menu.
- Content region built from text and media.
- Engagement region built from count items.
- Action region built from action buttons.

These repeats are useful as structural anchors, but should be addressed via semantic or accessible attributes rather than generated class names.

## Explicit Rejections

Do not build selectors from:

- Generated class names such as `XQidInOZdUqrHGlQkkUpVUZDTyqjTPrnrE` or similar opaque tokens.
- Fixed positional indexes like `:nth-child(...)` or assumptions about the first `div` under a node.
- Anonymous `div` traversal without a stable semantic or attribute-based anchor.

## Practical Selector Guidance

Preferred selector families for this article:

- Root identity: `article[data-urn^="urn:li:activity:"]`
- Author metadata: `.update-components-actor__*`
- Commentary text: `.feed-shared-inline-show-more-text`, `.update-components-text`
- Media: `.update-components-image`, `img[alt="View image"]`
- Engagement: `.social-details-social-counts__*`
- Actions: `.feed-shared-social-action-bar`, `button[aria-label]`

The strongest observable anchors in this snapshot are the article `data-urn`, the author-region semantic classes, and the action buttons’ accessible labels.
