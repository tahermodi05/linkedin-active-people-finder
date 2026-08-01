# Purpose
This proposal identifies where a committed HTML snapshot of the LinkedIn Activity page should be captured in the extension workflow.

The capture should occur in the page context after the Activity page has loaded, so the extension can serialize the observable DOM without changing extraction behavior.

# Capture Location
The appropriate capture point is the extension content script, which already runs in the LinkedIn page context and can access `document` directly.

That is the same layer used for profile-page detection and verification messaging, so it is the natural place to serialize the Activity page DOM when a real snapshot needs to be recorded.

# Trigger
The trigger should be a manual, user-initiated action from the extension workflow after the user opens a LinkedIn Activity page in the active tab.

The existing background-to-content message pattern is the right integration point to reuse, because it already separates browser UI actions from page-context DOM work.

# Output File
The committed snapshot should be written to:

`docs/html-snapshots/activity-page.html`

This keeps Activity snapshots aligned with the existing committed snapshot convention used elsewhere in the repository.

# Manual Workflow
1. Open the LinkedIn Activity page in the browser.
2. Trigger the extension’s manual capture action from the existing extension workflow.
3. Let the content script serialize the current page DOM in the page context.
4. Copy the resulting HTML into `docs/html-snapshots/activity-page.html`.
5. Update the corresponding architecture map only after the committed snapshot is replaced with a real Activity page HTML file.

# Engineering Notes
This proposal reuses the existing extension architecture rather than introducing a separate capture path.

It keeps snapshot capture a manual documentation workflow, avoids runtime behavior changes, and preserves a clear boundary between page-context serialization and downstream extractor work.
