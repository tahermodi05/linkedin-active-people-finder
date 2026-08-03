function getText(element) {
  return element?.textContent?.replace(/\s+/g, " ").trim() || null;
}

function getLeafTexts(root) {
  try {
    return [...root.querySelectorAll("main *")]
      .filter((element) => element.children.length === 0)
      .map((element) => getText(element))
      .filter(Boolean);
  } catch {
    return [];
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
  try {
    const topCard =
      root.querySelector('section[aria-label="Primary content"]') || root;

    const oldName = topCard.querySelector("h2");

    if (oldName) {
      return getText(oldName);
    }

    return getText(root.querySelector("main h2"));
  } catch {
    return null;
  }
}

function extractHeadline(root) {
  try {
    const topCard =
      root.querySelector('section[aria-label="Primary content"]') || root;

    const texts = [...topCard.querySelectorAll("p")]
      .map((element) => getText(element))
      .filter(Boolean);

    let connectionIndex = -1;

    texts.forEach((text, index) => {
      if (/^·\s*(1st|2nd|3rd\+)$/.test(text)) {
        connectionIndex = index;
      }
    });

    if (
      connectionIndex !== -1 &&
      texts[connectionIndex + 1]
    ) {
      return texts[connectionIndex + 1];
    }

    return null;
  } catch {
    return null;
  }
}

function extractLocation(root) {
  const texts = getLeafTexts(root);

  return (
    texts.find((text) =>
      /^[^@]+,\s*[^@]+,\s*(India|USA|Canada|UK|Australia)$/i.test(text)
    ) || null
  );
}

function extractCurrentCompany(root) {
  const texts = getLeafTexts(root);

  const ignored = new Set([
    extractFullName(root),
    extractHeadline(root),
    extractLocation(root),
  ]);

  return (
    texts.find(
      (text) =>
        !ignored.has(text) &&
        !text.includes("followers") &&
        !text.includes("connections") &&
        !text.includes("mutual") &&
        text.length > 1
    ) || null
  );
}

export function extractProfileHeader(root) {
  return {
    profileUrl: extractProfileUrl(root),
    fullName: extractFullName(root),
    headline: extractHeadline(root),
    location: extractLocation(root),
    currentCompany: extractCurrentCompany(root),
  };
}
