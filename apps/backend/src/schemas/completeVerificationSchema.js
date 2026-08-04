import { z } from "zod";

export const completeVerificationSchema = z
  .object({
    verificationStatus: z.enum(["completed"]),

    currentlyWorksHere: z.boolean(),

    activityIntelligence: z.record(z.any()).optional(),

    verificationConfidence: z
      .object({
        score: z.number(),
        level: z.string(),
      })
      .optional(),

    scanId: z.string().optional(),
  })
  .strict();