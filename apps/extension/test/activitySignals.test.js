import assert from "node:assert/strict";
import { test } from "node:test";

import { buildActivitySignals } from "../signals/activitySignals.js";

test("buildActivitySignals returns the committed object shape for empty input", () => {
  const result = buildActivitySignals({ postCount: 0, posts: [] });

  assert.deepEqual(Object.keys(result), ["totalPosts", "hasPosts", "validPosts"]);
  assert.deepEqual(result, {
    totalPosts: 0,
    hasPosts: false,
    validPosts: 0,
  });
});

test("buildActivitySignals counts one valid post", () => {
  const result = buildActivitySignals({
    postCount: 1,
    posts: [{ activityUrn: "urn:li:activity:1" }],
  });

  assert.deepEqual(result, {
    totalPosts: 1,
    hasPosts: true,
    validPosts: 1,
  });
});

test("buildActivitySignals counts multiple valid posts", () => {
  const result = buildActivitySignals({
    postCount: 3,
    posts: [
      { activityUrn: "urn:li:activity:1" },
      { activityUrn: "urn:li:activity:2" },
      { activityUrn: "urn:li:activity:3" },
    ],
  });

  assert.deepEqual(result, {
    totalPosts: 3,
    hasPosts: true,
    validPosts: 3,
  });
});

test("buildActivitySignals excludes null urns", () => {
  const result = buildActivitySignals({
    postCount: 3,
    posts: [
      { activityUrn: "urn:li:activity:1" },
      { activityUrn: null },
      { activityUrn: null },
    ],
  });

  assert.deepEqual(result, {
    totalPosts: 3,
    hasPosts: true,
    validPosts: 1,
  });
});

test("buildActivitySignals is deterministic", () => {
  const input = {
    postCount: 2,
    posts: [{ activityUrn: "urn:li:activity:1" }, { activityUrn: null }],
  };

  const first = buildActivitySignals(input);
  const second = buildActivitySignals(input);

  assert.deepEqual(first, second);
  assert.deepEqual(input, {
    postCount: 2,
    posts: [{ activityUrn: "urn:li:activity:1" }, { activityUrn: null }],
  });
});
