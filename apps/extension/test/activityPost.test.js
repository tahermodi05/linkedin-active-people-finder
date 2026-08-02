import test from "node:test";
import assert from "node:assert/strict";

import { JSDOM } from "jsdom";

import { extractActivityPost } from "../extractors/activityPost.js";

function createDom(articleHtml) {
  const dom = new JSDOM(`<!doctype html><html><body>${articleHtml}</body></html>`);

  return dom.window.document;
}

test("extracts image activity from a normalized article DOM", () => {
  const document = createDom(`
    <article role="article" data-urn="urn:li:activity:1">
      <header>
        <a href="https://www.linkedin.com/in/example">
          <span>Example Author</span>
        </a>
      </header>
      <span data-testid="expandable-text-box">Image post text</span>
      <img class="feed-shared-image-viewer__image" src="https://example.com/image.jpg" />
    </article>
  `);

  const result = extractActivityPost(document);

  assert.equal(result.success, true);
  assert.equal(result.type, "image");
  assert.equal(result.author, "Example Author");
  assert.equal(result.authorProfileUrl, "https://www.linkedin.com/in/example");
  assert.equal(result.text, "Image post text");
  assert.deepEqual(result.images, ["https://example.com/image.jpg"]);
});

test("extracts video activity from a normalized article DOM", () => {
  const document = createDom(`
    <article role="article" data-urn="urn:li:activity:2">
      <header>
        <a href="https://www.linkedin.com/in/video-author">
          <span>Video Author</span>
        </a>
      </header>
      <span data-testid="expandable-text-box">Video post text</span>
      <video class="vjs-tech" src="https://example.com/video.mp4"></video>
      <div class="vjs-poster">
        <img src="https://example.com/poster.jpg" />
      </div>
    </article>
  `);

  const result = extractActivityPost(document);

  assert.equal(result.success, true);
  assert.equal(result.type, "video");
  assert.equal(result.video?.hasVideo, true);
  assert.equal(result.video?.src, "https://example.com/video.mp4");
  assert.equal(result.video?.poster, "https://example.com/poster.jpg");
});

test("extracts document activity from a normalized article DOM", () => {
  const document = createDom(`
    <article role="article" data-urn="urn:li:activity:3">
      <header>
        <a href="https://www.linkedin.com/in/document-author">
          <span>Document Author</span>
        </a>
      </header>
      <span data-testid="expandable-text-box">Document post text</span>
      <iframe
        class="document-s-container__document-element"
        title="Document title"
        src="https://example.com/document"
      ></iframe>
    </article>
  `);

  const result = extractActivityPost(document);

  assert.equal(result.success, true);
  assert.equal(result.type, "document");
  assert.equal(result.document?.hasDocument, true);
  assert.equal(result.document?.title, "Document title");
  assert.equal(result.document?.src, "https://example.com/document");
});

test("extracts engagement signals from normalized article DOM", () => {
  const html = `
    <article data-urn="urn:li:activity:123">
      <span class="social-details-social-counts__reactions-count">
        120
      </span>

      <span class="social-details-social-counts__comments">
        15 comments
      </span>

      <span class="social-details-social-counts__reposts">
        4 reposts
      </span>
    </article>
  `;

  const dom = new JSDOM(html);

  const result = extractActivityPost(dom.window.document);

  assert.deepEqual(result.engagement, {
    reactions: 120,
    comments: 15,
    reposts: 4,
  });
});