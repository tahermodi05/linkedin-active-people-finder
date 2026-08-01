import { extractActivityContent } from "./activityContent.js";

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
    content: extractActivityContent(item),
  };
}
