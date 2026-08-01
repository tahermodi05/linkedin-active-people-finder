function getActivityItems(root) {
  try {
    return root?.querySelectorAll?.('article[data-urn^="urn:li:activity:"]') || [];
  } catch {
    return [];
  }
}

function getActivityUrn(item) {
  try {
    const urn = item?.getAttribute?.("data-urn") || null;

    return typeof urn === "string" && urn.startsWith("urn:li:activity:")
      ? urn
      : null;
  } catch {
    return null;
  }
}

function extractPost(item) {
  return {
    activityUrn: getActivityUrn(item),
  };
}

export function extractRecentPosts(root) {
  const items = getActivityItems(root);
  const posts = Array.from(items, extractPost);

  return {
    postCount: posts.length,
    posts,
  };
}
