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

test("extractRecentPosts returns normalized activity posts", () => {
  const html = loadSnapshot();
  const root = createRecentPostsRoot(html);

  const result = extractRecentPosts(root, (item) => ({
    success: true,
    root: item,
    urn: item.getAttribute("data-urn"),
    type: "text",
    author: null,
    authorProfileUrl: null,
    text: null,
    images: [],
    video: null,
    document: null,
  }));

  assert.deepEqual(Object.keys(result), ["postCount", "posts"]);
  assert.equal(result.postCount, 5);
  assert.equal(result.posts.length, 5);

  for (const post of result.posts) {
    assert.deepEqual(Object.keys(post), [
      "success",
      "root",
      "urn",
      "type",
      "author",
      "authorProfileUrl",
      "text",
      "images",
      "video",
      "document",
    ]);

    assert.equal(post.success, true);
    assert.ok(post.urn.startsWith("urn:li:activity:"));
    assert.equal(post.type, "text");
    assert.deepEqual(post.images, []);
  }
});