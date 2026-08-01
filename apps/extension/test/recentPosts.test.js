import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { extractRecentPosts } from "../extractors/recentPosts.js";

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

test("extractRecentPosts delegates to extractActivityPost for each article", () => {
  const calls = [];
  const html = loadSnapshot();
  const root = createRecentPostsRoot(html);

  const result = extractRecentPosts(root, (item) => {
    calls.push(item);

    return { activityUrn: item.getAttribute("data-urn") };
  });

  assert.equal(calls.length, result.posts.length);
  assert.equal(result.postCount, result.posts.length);
  assert.deepEqual(
    calls.map((item) => item.getAttribute("data-urn")),
    result.posts.map((post) => post.activityUrn)
  );
});

test("extractRecentPosts follows the committed snapshot contract", () => {
  const html = loadSnapshot();
  const root = createRecentPostsRoot(html);

  const result = extractRecentPosts(root);

  assert.deepEqual(Object.keys(result), ["postCount", "posts"]);
  assert.equal(result.postCount, result.posts.length);
  assert.ok(Array.isArray(result.posts));

  for (const post of result.posts) {
    assert.deepEqual(Object.keys(post), ["activityUrn"]);
    assert.ok(
      post.activityUrn === null ||
        (typeof post.activityUrn === "string" &&
          post.activityUrn.startsWith("urn:li:activity:"))
    );
  }

  assert.deepEqual(result, {
    postCount: 5,
    posts: [
      { activityUrn: "urn:li:activity:7487759344000794624" },
      { activityUrn: "urn:li:activity:7485347500183441408" },
      { activityUrn: "urn:li:activity:7485347481082404864" },
      { activityUrn: "urn:li:activity:7483058417943883776" },
      { activityUrn: "urn:li:activity:7482688747671588864" },
    ],
  });
});
