import { extractActivityPost } from "./activityPost.js";

function getActivityItems(root) {
  try {
    const legacyItems =
      root?.querySelectorAll?.('article[data-urn^="urn:li:activity:"]') || [];

    if (legacyItems.length > 0) {
      return legacyItems;
    }

    return root?.querySelectorAll?.(".feed-shared-update-v2") || [];
  } catch {
    return [];
  }
}

export function extractRecentPosts(root, extractPost = extractActivityPost) {
  const items = getActivityItems(root);
  const posts = Array.from(items, extractPost);

  return {
    postCount: posts.length,
    posts,
  };
}