function getText(element) {
  return element?.textContent?.replace(/\s+/g, " ").trim() || null;
}

function normalizeCompanyName(text) {
  return text?.replace(/\s+/g, " ").trim() || null;
}

function normalizeRoleName(text) {
  return text?.replace(/\s+/g, " ").trim() || null;
}

function normalizeDateText(text) {
  return text?.replace(/\s+/g, " ").trim() || null;
}

function isExperienceHeading(text) {
  return /^experience$/i.test(text || "");
}

function locateExperienceSection(root) {
  const sections = [...(root?.querySelectorAll?.("section") || [])];

  for (const section of sections) {
    const heading = getText(section.querySelector("h2, h3, h4, [role='heading']"));
    const ariaLabel = section.getAttribute?.("aria-label");

    if (isExperienceHeading(heading) || isExperienceHeading(ariaLabel)) {
      return section;
    }
  }

  return null;
}

function isVisibleElement(element) {
  if (!element) return false;

  const style = element.ownerDocument?.defaultView?.getComputedStyle(element);

  if (!style) return true;

  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    element.getClientRects().length > 0
  );
}

function isDateRangeText(text) {
  if (!text) return false;

  return /(\b\d{4}\b|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\b).+[-–—].+/i.test(
    text
  );
}

function parseExperienceDates(text) {
  if (!text) {
    return {
      startDate: null,
      endDate: null,
      duration: null,
      current: false,
    };
  }

  const normalized = text.replace(/\s+/g, " ").trim();
  const durationMatch = normalized.match(/(?:·|•)\s*(.+)$/);
  const datePart = durationMatch
    ? normalized.slice(0, durationMatch.index).trim()
    : normalized;
  const duration = durationMatch ? normalizeDateText(durationMatch[1]) : null;

  const rangeMatch = datePart.match(
    /^(.*?)\s*[-–—]\s*(present|current|now|today|ongoing|(?:\w{3,9}\.?\s+\d{4}|\d{4}))(?:\s*)$/i
  );

  if (!rangeMatch) {
    return {
      startDate: normalizeDateText(datePart) || null,
      endDate: null,
      duration,
      current: /present|current|now|today|ongoing/i.test(datePart),
    };
  }

  const startDate = normalizeDateText(rangeMatch[1]);
  const endDateRaw = normalizeDateText(rangeMatch[2]);
  const current = /^(present|current|now|today|ongoing)$/i.test(endDateRaw);

  return { startDate, endDate: endDateRaw, duration, current };
}

function pickMeaningfulTexts(card) {
  const nodes = [
    ...card.querySelectorAll("a, span, p, div, h1, h2, h3, h4, h5, h6"),
  ];

  const texts = [];
  const seen = new Set();

  for (const node of nodes) {
    const text = getText(node);

    if (!text || seen.has(text)) {
      continue;
    }

    seen.add(text);
    texts.push(text);
  }

  return texts;
}

function extractRole(card, texts) {
  const heading =
    getText(card.querySelector("h3, h4, [data-field='experience-role']")) ||
    null;

  if (heading) {
    return normalizeRoleName(heading);
  }

  const firstNonDateText = texts.find(
    (text) =>
      text &&
      !isDateRangeText(text) &&
      !/^\d+\s*(mo|mos|month|months|yr|yrs|year|years)$/i.test(text) &&
      !/^current$/i.test(text) &&
      !/^present$/i.test(text)
  );

  if (!firstNonDateText) {
    return null;
  }

  return normalizeRoleName(firstNonDateText);
}

function extractCompany(card, texts) {
  const companyLink = card.querySelector(
    "a[href*='/company/'], a[href*='/school/']"
  );

  const linkText = getText(companyLink);

  if (linkText) {
    return normalizeCompanyName(linkText);
  }

  const label = card.querySelector(
    "[data-field='experience-company'], [aria-label*='company' i]"
  );

  const labelText = getText(label);

  if (labelText) {
    return normalizeCompanyName(labelText);
  }

  const candidateTexts = texts.filter(
    (text) =>
      text &&
      !isDateRangeText(text) &&
      !/^\d+\s*(mo|mos|month|months|yr|yrs|year|years)$/i.test(text)
  );

  return normalizeCompanyName(candidateTexts[1] || candidateTexts[0] || null);
}

function extractExperienceCards(section) {
  const selectors = [
    "li",
    "article",
    "[data-view-name='profile-component-entity']",
    "[data-entity-urn]",
  ];

  const cards = new Set();

  for (const selector of selectors) {
    for (const element of section.querySelectorAll(selector)) {
      if (isVisibleElement(element)) {
        cards.add(element);
      }
    }
  }

  const results = [...cards].filter((card) => {
    const text = getText(card);
    return text && isDateRangeText(text);
  });

  return results;
}

export function extractExperience(root) {
  const section = locateExperienceSection(root);

  if (!section) {
    return {
      currentCompany: null,
      currentRole: null,
      currentlyWorking: false,
      employmentConfidence: "LOW",
      experience: [],
    };
  }

  const cards = extractExperienceCards(section);
  const experience = [];

  for (const card of cards) {
    const texts = pickMeaningfulTexts(card);
    const dateText = texts.find(isDateRangeText) || getText(card);
    const parsedDates = parseExperienceDates(dateText);
    const role = extractRole(card, texts);
    const company = extractCompany(card, texts);

    experience.push({
      company,
      role,
      startDate: parsedDates.startDate,
      endDate: parsedDates.endDate,
      duration: parsedDates.duration,
      current: parsedDates.current,
    });
  }

  const currentExperience =
    experience.find((item) => item.current && item.company && item.role) ||
    experience.find((item) => item.current && item.company) ||
    experience.find((item) => item.current) ||
    null;

  const currentCompany = currentExperience?.company || null;
  const currentRole = currentExperience?.role || null;
  const currentlyWorking = Boolean(currentExperience);

  let employmentConfidence = "LOW";

  if (currentCompany && currentRole) {
    employmentConfidence = "HIGH";
  } else if (currentCompany) {
    employmentConfidence = "MEDIUM";
  } else if (experience.length > 0) {
    employmentConfidence = "LOW";
  }

  return {
    currentCompany,
    currentRole,
    currentlyWorking,
    employmentConfidence,
    experience,
  };
}
