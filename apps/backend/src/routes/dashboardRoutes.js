import express from "express";

import {
  getDashboardSummary,
  getDashboardScans,
  getDashboardScan,
  deleteDashboardScan,
  deleteAllDashboardScans,
} from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/summary", getDashboardSummary);
router.get("/scans", getDashboardScans);
router.get("/scans/:scanId", getDashboardScan);

router.delete("/scans/:scanId", deleteDashboardScan);
router.delete("/scans", deleteAllDashboardScans);

export default router;
