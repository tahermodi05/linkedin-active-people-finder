function queryFirst(article, selectors) {
  if (typeof article?.querySelector !== "function") {
    return null;
  }

  for (const selector of selectors) {
    const element = article.querySelector(selector);

    if (element) {
      return element;
    }
  }

  return null;
}

function getPostText(article) {
  const element = queryFirst(article, [
    '[data-testid="expandable-text-box"]',
    ".feed-shared-inline-show-more-text",
    ".update-components-update-v2__commentary",
  ]);

  if (!element) {
    return null;
  }

  return element.textContent.replace(/\s+/g, " ").trim();
}

function getImages(article) {
  const images = article?.querySelectorAll?.(
    "img.feed-shared-image-viewer__image, img.feed-shared-image-viewer__image--loaded, img"
  );

  return [...(images || [])]
    .map((image) => image.currentSrc || image.src)
    .filter(Boolean);
}

function getVideo(article) {
  const video = queryFirst(article, ["video.vjs-tech", "video"]);

  if (!video) {
    return null;
  }

  const poster = article?.querySelector?.(".vjs-poster img");

  return {
    hasVideo: true,
    src: video.src || null,
    poster: poster?.src || null,
  };
}

function getDocument(article) {
  const iframe = queryFirst(article, [
    "iframe.document-s-container__document-element",
    "iframe.document-s-container__document-element--loaded",
  ]);

  if (!iframe) {
    return null;
  }

  return {
    hasDocument: true,
    title: iframe.title || null,
    src: iframe.src || null,
  };
}

function getActivityType(article) {
  if (getDocument(article)) {
    return "document";
  }

  if (getVideo(article)) {
    return "video";
  }

  if (getImages(article).length > 0) {
    return "image";
  }

  return "text";
}

function getAuthor(article) {
  const nameElement = queryFirst(article, [
    ".update-components-actor__title span",
    ".feed-shared-actor__title span",
    "header span",
  ]);

  if (!nameElement) {
    return {
      author: null,
      authorProfileUrl: null,
    };
  }

  const profileLink = nameElement.closest("a");

  return {
    author: nameElement.textContent.trim(),
    authorProfileUrl: profileLink?.href || null,
  };
}

export function extractActivityPost(root) {
  const article =
    root?.matches?.('[role="article"][data-urn], [role="article"], [data-urn]')
      ? root
      : root?.querySelector?.('[role="article"][data-urn], [role="article"], [data-urn]') ||
        queryFirst(root, [
          "article",
          '[data-testid="feed-shared-update-v2"]',
          ".feed-shared-update-v2",
        ]) ||
        queryFirst(root, [
          "video.vjs-tech",
          "iframe.document-s-container__document-element",
          "img.feed-shared-image-viewer__image",
        ])?.closest?.("article, [data-urn], section, div") ||
        null;

  if (!article) {
    return {
      success: false,
      reason: "Activity article not found",
    };
  }

  const author = getAuthor(article);

  return {
    success: true,
    root: article,
    urn: article.getAttribute("data-urn"),
    type: getActivityType(article),
    author: author.author,
    authorProfileUrl: author.authorProfileUrl,
    text: getPostText(article),
    images: getImages(article),
    video: getVideo(article),
    document: getDocument(article),
  };
}
