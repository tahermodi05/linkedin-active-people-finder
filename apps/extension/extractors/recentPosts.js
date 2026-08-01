import { extractActivityPost } from "./activityPost.js";

function getActivityItems(root) {
  try {
    return (
      root?.querySelectorAll?.('article[data-urn^="urn:li:activity:"]') || []
    );
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
