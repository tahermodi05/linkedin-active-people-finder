function getText(element) {
  return element?.textContent?.replace(/\s+/g, " ").trim() || null;
}

function normalizeProfileUrl(href) {
  if (!href) return null;

  try {
    const url = new URL(href, window.location.origin);

    if (!url.pathname.startsWith("/in/")) {
      return null;
    }

    url.search = "";
    url.hash = "";

    return `https://www.linkedin.com${url.pathname.replace(/\/$/, "")}/`;
  } catch {
    return null;
  }
}

function getCompanyPeopleCards(root = document) {
  return root.querySelectorAll(
    ".org-people-profile-card__profile-card-spacing"
  );
}

function getProfileLink(card) {
  const link = card.querySelector("a[href*='/in/']");
  return normalizeProfileUrl(link?.getAttribute("href") || link?.href);
}

function getSearchProfileLink(link) {
  return normalizeProfileUrl(link.getAttribute("href") || link.href);
}

function isVisible(element) {
  if (!element) return false;

  const style = window.getComputedStyle(element);

  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    element.getClientRects().length > 0
  );
}

function getVisibleTextNodes(element) {
  return [...(element?.querySelectorAll?.("p, span, a") || [])]
    .map((node) => getText(node))
    .filter(Boolean);
}

function findSmallestSearchResultContainer(profileLink) {
  let current = profileLink?.parentElement || null;

  while (current) {
    if (current.getAttribute?.("role") === "listitem") {
      return current;
    }

    current = current.parentElement;
  }

  return profileLink?.closest?.("div") || null;
}

function getAllProfileLinks(root = document) {
  return [...root.querySelectorAll("a[href*='/in/']")].filter((link) =>
    normalizeProfileUrl(link.getAttribute("href") || link.href)
  );
}

function extractProfileFromCard(card) {
  const profileUrl = getProfileLink(card);

  const profileLinks = [...card.querySelectorAll("a[href*='/in/']")];

  const profileLink =
    profileLinks.find((link) => getText(link)) || profileLinks[0] || null;

  const name = getText(profileLink);

  if (!profileUrl || !name) {
    return null;
  }

  return {
    name,
    profileUrl,
    headline: null,
    connectionDegree: null,
    mutualConnections: null,
  };
}

function extractProfileFromSearchLink(profileLink) {
  const card = findSmallestSearchResultContainer(profileLink);

  if (!card) {
    return null;
  }

  const profileUrl = getSearchProfileLink(profileLink);
  const texts = getVisibleTextNodes(card);
  const name = getText(profileLink);
  const nameIndex = texts.findIndex((text) => text === name);
  const headline =
    texts
      .slice(nameIndex + 1)
      .find(
        (text) =>
          text !== name &&
          !text.includes(name) &&
          !/^\s*•\s*\d+(st|nd|rd|th)\s*$/i.test(text) &&
          !/^(current|past):/i.test(text) &&
          !/^(connect|view)$/i.test(text) &&
          !/^[A-Z][a-z]+,\s*[A-Z][a-z]+/i.test(text)
      ) || null;

  if (!profileUrl || !name) {
    return null;
  }

  return {
    name,
    profileUrl,
    headline,
    connectionDegree:
      texts.find((text) => /^\s*•\s*\d+(st|nd|rd|th)\s*$/i.test(text))?.replace(/^•\s*/, "") || null,
    mutualConnections:
      texts.find((text) => /mutual connection/i.test(text)) || null,
  };
}

export function extractVisibleProfiles(root = document) {
  const profiles = [];
  const seenProfileUrls = new Set();

  const profileLinks = getAllProfileLinks(root);

  for (const profileLink of profileLinks) {
    const profile = extractProfileFromSearchLink(profileLink);

    if (!profile || seenProfileUrls.has(profile.profileUrl)) {
      continue;
    }

    seenProfileUrls.add(profile.profileUrl);
    profiles.push(profile);
  }

  return profiles;
}

export function extractCompanyPeopleProfiles(root = document) {
  const profiles = [];
  const seenProfileUrls = new Set();
  const employeeCards = getCompanyPeopleCards(root);

  for (const card of employeeCards) {
    if (!isVisible(card)) {
      continue;
    }

    const profile = extractProfileFromCard(card);

    if (!profile) {
      continue;
    }

    if (seenProfileUrls.has(profile.profileUrl)) {
      continue;
    }

    seenProfileUrls.add(profile.profileUrl);
    profiles.push(profile);
  }

  return profiles;
}

export { findSmallestSearchResultContainer, extractProfileFromSearchLink };
