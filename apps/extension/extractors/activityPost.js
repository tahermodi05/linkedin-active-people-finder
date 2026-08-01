import { extractActivityContent } from "./activityContent.js";
import { extractActivityPostType } from "./activityPostType.js";

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

export function extractActivityPost(item) {
  return {
    activityUrn: getActivityUrn(item),
    ...extractActivityPostType(item),
    content: extractActivityContent(item),
  };
}
