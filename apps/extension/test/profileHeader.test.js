import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { extractProfileHeader } from "../extractors/profileHeaderV2.js";

const SNAPSHOT_PATH = new URL(
  "../../../docs/html-snapshots/profile-page.html",
  import.meta.url
);

function loadSnapshot() {
  return readFileSync(SNAPSHOT_PATH, "utf8");
}

function findFirstMatch(html, pattern) {
  const match = html.match(pattern);
  return match ? match[1] : null;
}

function createTextNode(text) {
  return {
    textContent: text,
  };
}

function createProfileHeaderRoot(html) {
  const href = findFirstMatch(
    html,
    /<a[^>]*href="(https:\/\/www\.linkedin\.com\/in\/[^"]+)"[^>]*>\s*<div[^>]*aria-label="([^"]+)"/
  );

  const name = findFirstMatch(
    html,
    /<a[^>]*href="https:\/\/www\.linkedin\.com\/in\/[^"]+"[^>]*>[\s\S]*?<p[^>]*>([^<]+)<\/p>[\s\S]*?<div[^>]*>[\s\S]*?<p[^>]*><span>([^<]+)<\/span><\/p>/,
  );

  const profileUrl = href;
  const fullName = name;

  const identityLink = {
    textContent: fullName,
  };

  const topCard = {
    querySelector(selector) {
      if (selector === "h1, h2") {
        return createTextNode(fullName);
      }

      return null;
    },
    querySelectorAll(selector) {
      return [];
    },
  };

  const root = {
    ownerDocument: {
      defaultView: {
        location: {
          href: profileUrl,
        },
      },
    },
    querySelector(selector) {
      if (selector === 'section[aria-label="Primary content"]') {
        return topCard;
      }

      return null;
    },
    querySelectorAll() {
      return [];
    },
    textContent: identityLink.textContent,
  };

  return root;
}

test("extractProfileHeader follows the committed snapshot contract", () => {
  const html = loadSnapshot();
  const root = createProfileHeaderRoot(html);

  const result = extractProfileHeader(root);

  assert.deepEqual(Object.keys(result), [
    "profileUrl",
    "fullName",
    "headline",
    "location",
    "currentCompany",
    "currentRole",
    "currentlyWorking",
    "employmentConfidence",
    "experience",
  ]);
  assert.equal(result.profileUrl, "https://www.linkedin.com/in/sujal-jajal-63744024a/");
  assert.equal(result.fullName, "Sujal Jajal");
  assert.equal(result.headline, null);
  assert.equal(result.location, null);
  assert.equal(result.currentCompany, null);
  assert.equal(result.currentRole, null);
  assert.equal(result.currentlyWorking, false);
  assert.equal(result.employmentConfidence, "LOW");
  assert.deepEqual(result.experience, []);
});
