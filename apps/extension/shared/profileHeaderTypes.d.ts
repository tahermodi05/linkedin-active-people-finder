export interface ProfileHeaderData {
  profileUrl: string | null;
  fullName: string | null;
  headline: string | null;
  location: string | null;
  currentCompany: string | null;
  currentRole: string | null;
  currentlyWorking: boolean;
  employmentConfidence: "HIGH" | "MEDIUM" | "LOW";
  experience: Array<{
    company: string | null;
    role: string | null;
    startDate: string | null;
    endDate: string | null;
    duration: string | null;
    current: boolean;
  }>;
}
