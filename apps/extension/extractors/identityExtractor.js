function getText(element) {
  return element?.textContent?.replace(/\s+/g, " ").trim() || null;
}

function normalizeProfileUrl(href) {
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

function getTopCard(root) {
  return (
    root.querySelector('section[aria-label="Primary content"]') ||
    root.querySelector("main")
  );
}

function extractProfileUrl(root) {
  return normalizeProfileUrl(
    root?.ownerDocument?.defaultView?.location?.href
  );
}

function extractFullName(root) {
  const topCard = getTopCard(root);

  const heading = topCard?.querySelector("h1, h2");

  return getText(heading);
}

function extractHeadline(root) {
  const topCard = getTopCard(root);

  const paragraphs = [...topCard.querySelectorAll("p")]
    .map(getText)
    .filter(Boolean);

  return (
    paragraphs.find((text) => {
      if (text.startsWith("·")) {
        return false;
      }

      if (
        text.includes("followers") ||
        text.includes("connections") ||
        text.includes("Contact info")
      ) {
        return false;
      }

      return text.length > 10;
    }) || null
  );
}

function extractLocation(root) {
  const topCard = getTopCard(root);

  const paragraphs = [...topCard.querySelectorAll("p, span, div")]
    .map(getText)
    .filter(Boolean);

  return (
    paragraphs.find((text) =>
      /^[A-Za-z\s.'-]+,\s*[A-Za-z\s.'-]+(?:,\s*(India|USA|Canada|United Kingdom|UK|Australia))?$/.test(
        text
      )
    ) || null
  );
}

export function extractIdentity(root) {
  return {
    profileUrl: extractProfileUrl(root),
    fullName: extractFullName(root),
    headline: extractHeadline(root),
    location: extractLocation(root),
  };
}
