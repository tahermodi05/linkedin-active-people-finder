import express from "express";
import { completeVerificationSchema } from "../schemas/completeVerificationSchema.js";

import {
  search,
  getLatestScan,
  getNextProfile,
  completeCurrentVerification,
} from "../controllers/searchController.js";

import { validate } from "../middleware/validate.js";
import { searchSchema } from "../schemas/searchSchema.js";

const router = express.Router();

router.post("/", validate(searchSchema), search);
router.post(
  "/complete",
  validate(completeVerificationSchema),
  completeCurrentVerification
);
router.get("/latest", getLatestScan);
router.get("/next", getNextProfile);

export default router;