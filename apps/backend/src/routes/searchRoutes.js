import express from "express";

import { search } from "../controllers/searchController.js";
import { validate } from "../middleware/validate.js";
import { searchSchema } from "../schemas/searchSchema.js";

const router = express.Router();

router.post("/", validate(searchSchema), search);

export default router;