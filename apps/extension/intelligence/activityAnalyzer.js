export function analyzeActivities(posts = []) {
  const mediaBreakdown = {
    text: 0,
    image: 0,
    video: 0,
    document: 0,
  };

  for (const post of posts) {
    if (!post || !post.type) {
      continue;
    }

    if (mediaBreakdown[post.type] !== undefined) {
      mediaBreakdown[post.type]++;
    }
  }

  return {
    totalPosts: posts.length,
    mediaBreakdown,
  };
}