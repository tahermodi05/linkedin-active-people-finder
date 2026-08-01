import assert from "node:assert/strict";
import { test } from "node:test";

import { extractActivityPostType } from "../extractors/activityPostType.js";

function createActivityPostTypeRoot() {
  return {};
}

test("extractActivityPostType returns the committed object shape", () => {
  const result = extractActivityPostType(createActivityPostTypeRoot());

  assert.deepEqual(Object.keys(result), ["type"]);
  assert.deepEqual(result, {
    type: "unknown",
  });
});

test("extractActivityPostType is deterministic", () => {
  const input = createActivityPostTypeRoot();

  const first = extractActivityPostType(input);
  const second = extractActivityPostType(input);

  assert.deepEqual(first, second);
});

test("extractActivityPostType returns unknown when observable evidence is absent", () => {
  const result = extractActivityPostType(createActivityPostTypeRoot());

  assert.deepEqual(result, {
    type: "unknown",
  });
});
