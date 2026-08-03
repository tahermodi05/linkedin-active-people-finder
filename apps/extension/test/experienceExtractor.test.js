import assert from "node:assert/strict";
import { test } from "node:test";

import { extractExperience } from "../extractors/experienceExtractor.js";

function textNode(text) {
  return { textContent: text };
}

function createCard({ role, company, dates }) {
  const nodes = [textNode(role), textNode(company), textNode(dates)];

  return {
    textContent: nodes.map((node) => node.textContent).join(" "),
    ownerDocument: {
      defaultView: {
        getComputedStyle() {
          return {
            display: "block",
            visibility: "visible",
          };
        },
      },
    },
    getClientRects() {
      return [1];
    },
    querySelector(selector) {
      if (selector === "h3, h4, [data-field='experience-role']") {
        return textNode(role);
      }

      if (
        selector === "a[href*='/company/'], a[href*='/school/']" ||
        selector === "[data-field='experience-company'], [aria-label*='company' i]"
      ) {
        return textNode(company);
      }

      return null;
    },
    querySelectorAll() {
      return nodes;
    },
  };
}

test("extractExperience reads current employment from the Experience section", () => {
  const currentCard = createCard({
    role: "Senior Engineer",
    company: "Acme Labs",
    dates: "Jan 2024 - Present · 1 yr 7 mos",
  });

  const pastCard = createCard({
    role: "Engineer",
    company: "Other Co",
    dates: "Mar 2021 - Dec 2023 · 2 yrs 10 mos",
  });

  const experienceSection = {
    textContent: "Experience",
    getAttribute(name) {
      if (name === "aria-label") {
        return "Experience";
      }

      return null;
    },
    querySelector(selector) {
      if (selector === "h2, h3, h4, [role='heading']") {
        return textNode("Experience");
      }

      return null;
    },
    querySelectorAll(selector) {
      if (selector === "li" || selector === "article") {
        return [currentCard, pastCard];
      }

      return [];
    },
  };

  const root = {
    querySelectorAll(selector) {
      if (selector === "section") {
        return [experienceSection];
      }

      return [];
    },
  };

  const result = extractExperience(root);

  assert.equal(result.currentCompany, "Acme Labs");
  assert.equal(result.currentRole, "Senior Engineer");
  assert.equal(result.currentlyWorking, true);
  assert.equal(result.employmentConfidence, "HIGH");
  assert.deepEqual(result.experience, [
    {
      company: "Acme Labs",
      role: "Senior Engineer",
      startDate: "Jan 2024",
      endDate: "Present",
      duration: "1 yr 7 mos",
      current: true,
    },
    {
      company: "Other Co",
      role: "Engineer",
      startDate: "Mar 2021",
      endDate: "Dec 2023",
      duration: "2 yrs 10 mos",
      current: false,
    },
  ]);
});
