import { extractIdentity } from "./identityExtractor.js";
import { extractExperience } from "./experienceExtractor.js";

export function extractProfileData(root) {
  const identity = extractIdentity(root);
  const experience = extractExperience(root);

  return {
    profileUrl: identity.profileUrl,
    fullName: identity.fullName,
    headline: identity.headline,
    location: identity.location,
    currentCompany: experience.currentCompany,
    currentRole: experience.currentRole,
    currentlyWorking: experience.currentlyWorking,
    employmentConfidence: experience.employmentConfidence,
    experience: experience.experience,
  };
}

export { extractProfileData as extractProfileHeader };
