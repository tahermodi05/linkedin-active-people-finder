import { z } from "zod";

export const completeVerificationSchema = z
  .object({
    verificationStatus: z.enum(["completed"]),

    currentlyWorksHere: z.boolean(),

    activityIntelligence: z.record(z.any()).optional(),
  })
  .strict();