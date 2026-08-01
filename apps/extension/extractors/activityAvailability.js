function getDocument(root) {
  return root?.ownerDocument || root?.document || null;
}

function hasActivityPage(root) {
  const title = getDocument(root)?.title || "";

  return /\bActivity\b/.test(title);
}

function getActivityFeedContainer(root) {
  try {
    return root?.querySelector?.("main") || null;
  } catch {
    return null;
  }
}

function getVisibleActivityItems(root) {
  try {
    return root?.querySelectorAll?.('article[data-urn^="urn:li:activity:"]') || [];
  } catch {
    return [];
  }
}

export function extractActivityAvailability(root) {
  const hasActivity = hasActivityPage(root);
  const activityFeedPresent = !!getActivityFeedContainer(root);
  const activityItemsVisible = getVisibleActivityItems(root).length > 0;

  return {
    hasActivity,
    activityFeedPresent,
    activityItemsVisible,
  };
}
