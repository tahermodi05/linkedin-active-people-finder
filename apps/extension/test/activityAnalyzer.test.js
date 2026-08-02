import assert from "node:assert/strict";
import { test } from "node:test";

import { analyzeActivities } from "../intelligence/activityAnalyzer.js";

test("analyzeActivities returns media breakdown", () => {
  const result = analyzeActivities([
    {
      type: "text",
    },
    {
      type: "image",
    },
    {
      type: "video",
    },
    {
      type: "video",
    },
    {
      type: "document",
    },
  ]);

  assert.deepEqual(result, {
    totalPosts: 5,
    mediaBreakdown: {
      text: 1,
      image: 1,
      video: 2,
      document: 1,
    },
  });
});

test("analyzeActivities handles empty input", () => {
  const result = analyzeActivities();

  assert.deepEqual(result, {
    totalPosts: 0,
    mediaBreakdown: {
      text: 0,
      image: 0,
      video: 0,
      document: 0,
    },
  });
});