function getText(element) {
  return element?.textContent?.replace(/\s+/g, " ").trim() || null;
}

function getTopCard(root) {
  try {
    return root?.querySelector?.('section[aria-label="Primary content"]') || root || null;
  } catch {
    return null;
  }
}

function getIdentitySection(root) {
  const topCard = getTopCard(root);

  if (!topCard) {
    return null;
  }

  try {
    return topCard.querySelector("h2") || null;
  } catch {
    return null;
  }
}

function getProfileInfoSection(root) {
  const topCard = getTopCard(root);

  if (!topCard) {
    return null;
  }

  try {
    return [...topCard.querySelectorAll('a[href="#"]')].find((link) => getText(link) === "Contact info") || null;
  } catch {
    return null;
  }
}

function getSocialSignalsSection(root) {
  const topCard = getTopCard(root);

  if (!topCard) {
    return null;
  }

  try {
    return [...topCard.querySelectorAll('a[target="_blank"]')].find((link) => /mutual connections/i.test(getText(link) || "")) || null;
  } catch {
    return null;
  }
}

function extractProfileUrl(root) {
  const href = root?.ownerDocument?.defaultView?.location?.href || null;

  if (!href) {
    return null;
  }

  try {
    const url = new URL(href);

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

function extractFullName(root) {
  const identitySection = getIdentitySection(root);

  if (!identitySection) {
    return null;
  }

  try {
    return getText(identitySection);
  } catch {
    return null;
  }
}

function extractHeadline(root) {
  return null;
}

function extractLocation() {
  return null;
}

function extractCurrentCompany() {
  return null;
}

export function extractProfileHeader(root) {
  const topCard = getTopCard(root);

  if (!topCard) {
    return {
      profileUrl: null,
      fullName: null,
      headline: null,
      location: null,
      currentCompany: null,
    };
  }

  return {
    profileUrl: extractProfileUrl(root),
    fullName: extractFullName(root),
    headline: extractHeadline(root),
    location: extractLocation(root),
    currentCompany: extractCurrentCompany(root),
  };
}
