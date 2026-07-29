import { z } from "zod";

export const searchSchema = z.object({
  keyword: z
    .string()
    .trim()
    .min(1, "Keyword is required")
    .max(100, "Keyword is too long"),
});