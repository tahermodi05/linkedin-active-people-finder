export function buildActivitySignals(recentPosts) {
  const totalPosts = recentPosts?.postCount ?? 0;
  const posts = Array.isArray(recentPosts?.posts) ? recentPosts.posts : [];

  return {
    totalPosts,
    hasPosts: totalPosts > 0,
    validPosts: posts.reduce(
      (count, post) => count + (post?.activityUrn !== null ? 1 : 0),
      0
    ),
  };
}
