import { z } from "zod";

const profileSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),

  profileUrl: z.string().url("Profile URL must be a valid URL"),

  headline: z.string().nullable().optional(),

  connectionDegree: z.string().nullable().optional(),

  mutualConnections: z.string().nullable().optional(),
});

export const searchSchema = z.object({
  profiles: z
    .array(profileSchema)
    .min(1, "At least one profile is required"),
});