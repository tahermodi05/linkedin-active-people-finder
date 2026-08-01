function normalizeWhitespace(text) {
  return text.replace(/\s+/g, " ").trim();
}

function getCommentaryContainer(root) {
  try {
    return (
      root?.querySelector?.(".update-components-update-v2__commentary") ||
      root?.querySelector?.(".feed-shared-inline-show-more-text") ||
      null
    );
  } catch {
    return null;
  }
}

export function extractActivityContent(root) {
  const container = getCommentaryContainer(root);
  const text = container?.textContent;

  if (typeof text !== "string") {
    return {
      text: null,
    };
  }

  const normalizedText = normalizeWhitespace(text);

  return {
    text: normalizedText.length > 0 ? normalizedText : null,
  };
}
