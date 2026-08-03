import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { JSDOM } from "jsdom";

const FIXTURE_PATH = new URL(
  "../test-fixtures/people-search.html",
  import.meta.url
);

function loadFixture() {
  return readFileSync(FIXTURE_PATH, "utf8");
}

async function loadScanner(document) {
  globalThis.window = document.defaultView;
  globalThis.document = document;
  globalThis.Node = document.defaultView.Node;

  return import(`../scanners/searchScanner.js?fixture=${Date.now()}`);
}

function buildDocument() {
  const dom = new JSDOM(loadFixture(), {
    url: "https://www.linkedin.com/search/results/people/?keywords=Marketing%20Manager",
  });

  return dom.window.document;
}

test("search traversal extracts profiles from the fixture and deduplicates results", async () => {
  const document = buildDocument();
  const scanner = await loadScanner(document);

  const duplicateSource = document.querySelector(
    'a[href="https://www.linkedin.com/in/victoria-agosta-145b11314/"]'
  );

  assert.ok(duplicateSource);

  const duplicateRow = duplicateSource.closest('[role="listitem"]');
  assert.ok(duplicateRow);

  duplicateRow.parentElement?.appendChild(duplicateRow.cloneNode(true));

  const profiles = scanner.extractVisibleProfiles(document);

  assert.ok(profiles.length > 0);
  assert.equal(
    new Set(profiles.map((profile) => profile.profileUrl)).size,
    profiles.length
  );

  const victoria = profiles.find((profile) =>
    profile.profileUrl ===
    "https://www.linkedin.com/in/victoria-agosta-145b11314/"
  );

  assert.ok(victoria);
  assert.equal(victoria.name, "Victoria Agosta");
  assert.equal(victoria.headline, "Digital Marketing Manager");
  assert.equal(victoria.profileUrl, "https://www.linkedin.com/in/victoria-agosta-145b11314/");
});

test("search traversal extracts headline and profileUrl for visible people results", async () => {
  const document = buildDocument();
  const scanner = await loadScanner(document);

  const profiles = scanner.extractVisibleProfiles(document);

  const sherrie = profiles.find((profile) =>
    profile.profileUrl === "https://www.linkedin.com/in/sherrie-yu/"
  );

  assert.ok(sherrie);
  assert.equal(sherrie.name, "Sherrie Yu");
  assert.equal(sherrie.headline, "Marketing Manager at PetsWorld");
  assert.equal(sherrie.profileUrl, "https://www.linkedin.com/in/sherrie-yu/");
});
