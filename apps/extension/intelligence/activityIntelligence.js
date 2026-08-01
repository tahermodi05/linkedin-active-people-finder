import { extractRecentPosts } from "../extractors/recentPosts.js";
import { buildActivitySignals } from "../signals/activitySignals.js";

export function buildActivityIntelligence(root) {
  const recentPosts = extractRecentPosts(root);
  const signals = buildActivitySignals(recentPosts);

  return {
    recentPosts,
    signals,
  };
}
