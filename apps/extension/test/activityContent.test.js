import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { extractActivityContent } from "../extractors/activityContent.js";

const SNAPSHOT_PATH = new URL(
  "../../../docs/html-snapshots/activity-page.html",
  import.meta.url
);

function loadSnapshot() {
  return readFileSync(SNAPSHOT_PATH, "utf8");
}

function createActivityContentRoot(textContent) {
  return {
    querySelector(selector) {
      if (
        selector === ".update-components-update-v2__commentary" ||
        selector === ".feed-shared-inline-show-more-text"
      ) {
        return textContent === null ? null : { textContent };
      }

      return null;
    },
  };
}

test("extractActivityContent returns the committed object shape", () => {
  const result = extractActivityContent(
    createActivityContentRoot("I spent the last two weeks breaking down")
  );

  assert.deepEqual(Object.keys(result), ["text"]);
  assert.deepEqual(result, {
    text: "I spent the last two weeks breaking down",
  });
});

test("extractActivityContent normalizes whitespace", () => {
  const result = extractActivityContent(
    createActivityContentRoot("  I spent\n\n the last   two weeks   ")
  );

  assert.deepEqual(result, {
    text: "I spent the last two weeks",
  });
});

test("extractActivityContent returns null when observable evidence is absent", () => {
  const result = extractActivityContent(createActivityContentRoot(null));

  assert.deepEqual(result, {
    text: null,
  });
});

test("extractActivityContent is deterministic", () => {
  const input = createActivityContentRoot(
    "I spent the last two weeks breaking down"
  );

  const first = extractActivityContent(input);
  const second = extractActivityContent(input);

  assert.deepEqual(first, second);
});

test("extractActivityContent follows the committed snapshot contract", () => {
  const html = loadSnapshot();
  const text = html.match(
    /I spent the last two weeks breaking down[\s\S]*?#Sales/
  )?.[0];

  const result = extractActivityContent(createActivityContentRoot(text || null));

  assert.equal(result.text, text ? text.replace(/\s+/g, " ").trim() : null);
});
