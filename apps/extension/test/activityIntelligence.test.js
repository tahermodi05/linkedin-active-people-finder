import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { buildActivityIntelligence } from "../intelligence/activityIntelligence.js";
import { extractRecentPosts } from "../extractors/recentPosts.js";
import { buildActivitySignals } from "../signals/activitySignals.js";

const SNAPSHOT_PATH = new URL(
  "../../../docs/html-snapshots/activity-page.html",
  import.meta.url
);

function loadSnapshot() {
  return readFileSync(SNAPSHOT_PATH, "utf8");
}

function createRecentPostsRoot(html) {
  const urns = Array.from(
    html.matchAll(/role="article"[^>]*data-urn="(urn:li:activity:[^"]+)"/gi),
    (match) => match[1]
  );

  const items = urns.map((urn) => ({
    getAttribute(name) {
      if (name === "data-urn") {
        return urn;
      }

      return null;
    },
  }));

  return {
    querySelectorAll(selector) {
      if (selector === 'article[data-urn^="urn:li:activity:"]') {
        return items;
      }

      return [];
    },
  };
}

test("buildActivityIntelligence orchestrates extractor then signals", () => {
  const calls = [];
  const root = {
    querySelectorAll(selector) {
      calls.push(["extractRecentPosts", selector]);

      if (selector === 'article[data-urn^="urn:li:activity:"]') {
        return [
          {
            getAttribute(name) {
              calls.push(["extractActivityPost", name]);
              return name === "data-urn" ? "urn:li:activity:1" : null;
            },
          },
        ];
      }

      return [];
    },
  };

  const result = buildActivityIntelligence(root);

  assert.deepEqual(calls, [
    ["extractRecentPosts", 'article[data-urn^="urn:li:activity:"]'],
    ["extractActivityPost", "data-urn"],
  ]);
  assert.deepEqual(result, {
    recentPosts: {
      postCount: 1,
      posts: [
        {
          activityUrn: "urn:li:activity:1",
          type: "unknown",
          content: { text: null },
        },
      ],
    },
    signals: {
      totalPosts: 1,
      hasPosts: true,
      validPosts: 1,
    },
  });
});

test("buildActivityIntelligence returns the committed object shape", () => {
  const html = loadSnapshot();
  const root = createRecentPostsRoot(html);

  const result = buildActivityIntelligence(root);

  assert.deepEqual(Object.keys(result), ["recentPosts", "signals"]);
  assert.deepEqual(Object.keys(result.recentPosts), ["postCount", "posts"]);
  assert.deepEqual(Object.keys(result.signals), [
    "totalPosts",
    "hasPosts",
    "validPosts",
  ]);
  assert.deepEqual(result, {
    recentPosts: {
      postCount: 5,
      posts: [
        {
          activityUrn: "urn:li:activity:7487759344000794624",
          type: "unknown",
          content: { text: null },
        },
        {
          activityUrn: "urn:li:activity:7485347500183441408",
          type: "unknown",
          content: { text: null },
        },
        {
          activityUrn: "urn:li:activity:7485347481082404864",
          type: "unknown",
          content: { text: null },
        },
        {
          activityUrn: "urn:li:activity:7483058417943883776",
          type: "unknown",
          content: { text: null },
        },
        {
          activityUrn: "urn:li:activity:7482688747671588864",
          type: "unknown",
          content: { text: null },
        },
      ],
    },
    signals: {
      totalPosts: 5,
      hasPosts: true,
      validPosts: 5,
    },
  });
});

test("buildActivityIntelligence is deterministic", () => {
  const html = loadSnapshot();
  const root = createRecentPostsRoot(html);

  const first = buildActivityIntelligence(root);
  const second = buildActivityIntelligence(root);

  assert.deepEqual(first, second);
  assert.deepEqual(first.recentPosts, extractRecentPosts(root));
  assert.deepEqual(first.signals, buildActivitySignals(first.recentPosts));
});
