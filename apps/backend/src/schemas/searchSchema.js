import { z } from "zod";

export const searchSchema = z.object({
  keyword: z
    .string()
    .trim()
    .min(2, "Keyword must be at least 2 characters long")
    .max(100, "Keyword cannot exceed 100 characters"),
});