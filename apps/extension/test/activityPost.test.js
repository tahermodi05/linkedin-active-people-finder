import assert from "node:assert/strict";
import { test } from "node:test";

import { extractActivityPost } from "../extractors/activityPost.js";

function createActivityPostRoot(urn, textContent = "  I spent\n\n the last two weeks breaking down  ") {
  return {
    getAttribute(name) {
      if (name === "data-urn") {
        return urn;
      }

      return null;
    },
    querySelector(selector) {
      if (
        selector === ".update-components-update-v2__commentary" ||
        selector === ".feed-shared-inline-show-more-text"
      ) {
        if (textContent === null) {
          return null;
        }

        return {
          textContent,
        };
      }

      return null;
    },
  };
}

test("extractActivityPost returns the committed object shape", () => {
  const result = extractActivityPost(
    createActivityPostRoot("urn:li:activity:7487759344000794624")
  );

  assert.deepEqual(Object.keys(result), ["activityUrn", "type", "content"]);
  assert.deepEqual(result, {
    activityUrn: "urn:li:activity:7487759344000794624",
    type: "unknown",
    content: {
      text: "I spent the last two weeks breaking down",
    },
  });
});

test("extractActivityPost returns null when observable evidence is absent", () => {
  const result = extractActivityPost(createActivityPostRoot(null, null));

  assert.deepEqual(result, {
    activityUrn: null,
    type: "unknown",
    content: {
      text: null,
    },
  });
});

test("extractActivityPost is deterministic", () => {
  const input = createActivityPostRoot("urn:li:activity:7487759344000794624");

  const first = extractActivityPost(input);
  const second = extractActivityPost(input);

  assert.deepEqual(first, second);
});

test("extractActivityPost delegates to the content extractor", () => {
  const input = createActivityPostRoot(
    "urn:li:activity:7487759344000794624",
    "  one\n\n two  "
  );

  const result = extractActivityPost(input);

  assert.deepEqual(result.content, {
    text: "one two",
  });
});

test("extractActivityPost delegates to the post type extractor", () => {
  const input = createActivityPostRoot(
    "urn:li:activity:7487759344000794624",
    "  one\n\n two  "
  );

  const result = extractActivityPost(input);

  assert.equal(result.type, "unknown");
});
