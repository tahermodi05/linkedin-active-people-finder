import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { buildActivityIntelligence } from "../intelligence/activityIntelligence.js";
import { extractRecentPosts } from "../extractors/recentPosts.js";
import { buildActivitySignals } from "../signals/activitySignals.js";
import { analyzeActivities } from "../intelligence/activityAnalyzer.js";

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

test("buildActivityIntelligence returns empty intelligence when no posts exist", () => {
  const result = buildActivityIntelligence({
    querySelectorAll() {
      return [];
    },
  });

  assert.deepEqual(Object.keys(result), [
    "recentPosts",
    "signals",
    "analysis",
  ]);

  assert.deepEqual(result.recentPosts, {
    postCount: 0,
    posts: [],
  });

  assert.deepEqual(result.signals, {
    totalPosts: 0,
    hasPosts: false,
    validPosts: 0,
  });

  assert.deepEqual(result.analysis, {
    totalPosts: 0,
    mediaBreakdown: {
      text: 0,
      image: 0,
      video: 0,
      document: 0,
    },
  });
});

test("buildActivityIntelligence returns normalized activity intelligence", () => {
  const html = loadSnapshot();
  const root = createRecentPostsRoot(html);

  const result = buildActivityIntelligence(root);

  assert.deepEqual(Object.keys(result), [
    "recentPosts",
    "signals",
    "analysis",
  ]);

  assert.equal(result.recentPosts.postCount, 5);
  assert.equal(result.recentPosts.posts.length, 5);

  assert.deepEqual(result.signals, {
    totalPosts: 5,
    hasPosts: true,
    validPosts: 5,
  });

  assert.deepEqual(result.analysis, analyzeActivities(result.recentPosts.posts));
});

test("buildActivityIntelligence is deterministic", () => {
  const html = loadSnapshot();
  const root = createRecentPostsRoot(html);

  const first = buildActivityIntelligence(root);
  const second = buildActivityIntelligence(root);

  assert.deepEqual(first, second);
  assert.deepEqual(first.recentPosts, extractRecentPosts(root));
  assert.deepEqual(first.signals, buildActivitySignals(first.recentPosts));
  assert.deepEqual(
    first.analysis,
    analyzeActivities(first.recentPosts.posts)
  );
});