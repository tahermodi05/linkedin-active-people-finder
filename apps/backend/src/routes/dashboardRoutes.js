import express from "express";

import {
  getDashboardSummary,
  getDashboardScans,
  getDashboardScan,
} from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/summary", getDashboardSummary);
router.get("/scans", getDashboardScans);
router.get("/scans/:scanId", getDashboardScan);

export default router;
