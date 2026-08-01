import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { extractActivityAvailability } from "../extractors/activityAvailability.js";

const SNAPSHOT_PATH = new URL(
  "../../../docs/html-snapshots/activity-page.html",
  import.meta.url
);

function loadSnapshot() {
  return readFileSync(SNAPSHOT_PATH, "utf8");
}

function createActivityAvailabilityRoot(html) {
  const hasMain = /<main\b/i.test(html);
  const activityItemsVisible = /role="article"[^>]*data-urn="urn:li:activity:/i.test(html);

  return {
    ownerDocument: {
      title: /<title>[^<]*Activity[^<]*<\/title>/i.test(html)
        ? "Activity | Snapshot"
        : "Snapshot",
    },
    querySelector(selector) {
      if (selector === "main") {
        return hasMain ? {} : null;
      }

      return null;
    },
    querySelectorAll(selector) {
      if (selector === 'article[data-urn^="urn:li:activity:"]') {
        return activityItemsVisible ? [{}, {}, {}, {}, {}] : [];
      }

      return [];
    },
  };
}

test("extractActivityAvailability follows the committed snapshot contract", () => {
  const html = loadSnapshot();
  const root = createActivityAvailabilityRoot(html);

  const result = extractActivityAvailability(root);

  assert.deepEqual(Object.keys(result), [
    "hasActivity",
    "activityFeedPresent",
    "activityItemsVisible",
  ]);
  assert.equal(typeof result.hasActivity, "boolean");
  assert.equal(typeof result.activityFeedPresent, "boolean");
  assert.equal(typeof result.activityItemsVisible, "boolean");
  assert.deepEqual(result, {
    hasActivity: true,
    activityFeedPresent: true,
    activityItemsVisible: true,
  });
});
