import express from "express";

import {
  search,
  getLatestScan,
} from "../controllers/searchController.js";

import { validate } from "../middleware/validate.js";
import { searchSchema } from "../schemas/searchSchema.js";

const router = express.Router();

router.post("/", validate(searchSchema), search);
router.get("/latest", getLatestScan);

export default router;