function getText(element) {
  return element?.textContent?.replace(/\s+/g, " ").trim() || null;
}

function getTopCard(root) {
  try {
    return root?.querySelector?.('[id$="Topcard"]') || null;
  } catch {
    return null;
  }
}

function getProfileLink(root) {
  try {
    return (
      getTopCard(root)?.querySelector('a[href^="https://www.linkedin.com/in/"]') ||
      null
    );
  } catch {
    return null;
  }
}

function getContactInfoLink(root) {
  try {
    return [...(getTopCard(root)?.querySelectorAll('a[href="#"]') || [])].find(
      (link) => getText(link) === "Contact info"
    ) || null;
  } catch {
    return null;
  }
}

function getSignalBlock(root) {
  try {
    return [...(getTopCard(root)?.querySelectorAll("div") || [])].find((element) => {
      const hasFollowers = [...element.querySelectorAll("p")].some((paragraph) =>
        /^\d[\d,]* followers$/i.test(getText(paragraph) || "")
      );
      const hasConnections = [...element.querySelectorAll("p")].some((paragraph) =>
        getText(paragraph)?.toLowerCase() === "connections"
      );
      const mutualLink = element.querySelector('a[target="_blank"]');
      const href = mutualLink?.getAttribute("href") || "";

      return (
        hasFollowers &&
        hasConnections &&
        href.includes("connectionOf=%5B%22ACo") &&
        /mutual connections/i.test(getText(mutualLink) || "")
      );
    }) || null;
  } catch {
    return null;
  }
}

function getProfileUrl(root) {
  const href = root?.location?.href || root?.URL || null;

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

function extractName(root) {
  const profileLink = getProfileLink(root);

  if (!profileLink) {
    return null;
  }

  try {
    return getText(profileLink.querySelector("p"));
  } catch {
    return null;
  }
}

function extractHeadline(root) {
  const profileLink = getProfileLink(root);

  if (!profileLink) {
    return null;
  }

  try {
    const headlineContainer = profileLink.querySelector("div > div");

    return getText(headlineContainer?.querySelector("p"));
  } catch {
    return null;
  }
}

function extractCompany(root) {
  const contactInfoLink = getContactInfoLink(root);

  if (!contactInfoLink) {
    return null;
  }

  try {
    const row = contactInfoLink.closest("div");
    const companyParagraph = row?.previousElementSibling?.querySelector?.("p");

    return getText(companyParagraph);
  } catch {
    return null;
  }
}

function extractLocation(root) {
  const contactInfoLink = getContactInfoLink(root);

  if (!contactInfoLink) {
    return null;
  }

  try {
    const row = contactInfoLink.closest("div");
    const locationParagraph = row?.querySelector?.("p");

    return getText(locationParagraph);
  } catch {
    return null;
  }
}

function extractFollowers(root) {
  const signalBlock = getSignalBlock(root);

  if (!signalBlock) {
    return null;
  }

  try {
    const followerParagraph = [...signalBlock.querySelectorAll("p")].find((paragraph) =>
      /^\d[\d,]* followers$/i.test(getText(paragraph) || "")
    );

    return getText(followerParagraph);
  } catch {
    return null;
  }
}

function extractConnections(root) {
  const signalBlock = getSignalBlock(root);

  if (!signalBlock) {
    return null;
  }

  try {
    const labelParagraph = [...signalBlock.querySelectorAll("p")].find(
      (paragraph) => getText(paragraph)?.toLowerCase() === "connections"
    );

    const count = getText(labelParagraph?.previousElementSibling);

    return count ? `${count} connections` : null;
  } catch {
    return null;
  }
}

function extractMutualConnections(root) {
  const signalBlock = getSignalBlock(root);

  if (!signalBlock) {
    return null;
  }

  try {
    const link = signalBlock.querySelector('a[target="_blank"]');
    const text = getText(link);

    return /mutual connections/i.test(text || "") ? text : null;
  } catch {
    return null;
  }
}

export function extractIdentity(root) {
  return {
    profileUrl: getProfileUrl(root),
    name: extractName(root),
    headline: extractHeadline(root),
    company: extractCompany(root),
    location: extractLocation(root),
  };
}

export function extractNetworkSignals(root) {
  return {
    followers: extractFollowers(root),
    connections: extractConnections(root),
    mutualConnections: extractMutualConnections(root),
  };
}

export function extractProfileHeader(root) {
  return {
    ...extractIdentity(root),
    ...extractNetworkSignals(root),
  };
}
