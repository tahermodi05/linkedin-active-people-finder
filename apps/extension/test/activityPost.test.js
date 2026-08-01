import assert from "node:assert/strict";
import { test } from "node:test";

import { extractActivityPost } from "../extractors/activityPost.js";

function createActivityPostRoot(urn) {
  return {
    getAttribute(name) {
      if (name === "data-urn") {
        return urn;
      }

      return null;
    },
  };
}

test("extractActivityPost returns the committed object shape", () => {
  const result = extractActivityPost(
    createActivityPostRoot("urn:li:activity:7487759344000794624")
  );

  assert.deepEqual(Object.keys(result), ["activityUrn"]);
  assert.deepEqual(result, {
    activityUrn: "urn:li:activity:7487759344000794624",
  });
});

test("extractActivityPost returns null when observable evidence is absent", () => {
  const result = extractActivityPost(createActivityPostRoot(null));

  assert.deepEqual(result, {
    activityUrn: null,
  });
});
