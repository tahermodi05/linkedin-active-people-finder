import { extractRecentPosts } from "../extractors/recentPosts.js";
import { buildActivitySignals } from "../signals/activitySignals.js";
import { analyzeActivities } from "./activityAnalyzer.js";

export function buildActivityIntelligence(root) {
  const recentPosts = extractRecentPosts(root);

  const signals = buildActivitySignals(recentPosts);

  const analysis = analyzeActivities(recentPosts.posts);

  return {
    recentPosts,
    signals,
    analysis,
  };
}