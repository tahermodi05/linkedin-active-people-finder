import {
  getDashboardSummary as getDashboardSummaryService,
  getDashboardScans as getDashboardScansService,
  getDashboardScan as getDashboardScanService,
} from "../services/dashboardService.js";

import { AppError } from "../errors/AppError.js";
import { successResponse } from "../utils/response.js";

export async function getDashboardSummary(req, res, next) {
  try {
    const result = await getDashboardSummaryService();

    return successResponse(res, result, "Dashboard summary retrieved");
  } catch (error) {
    next(error);
  }
}

export async function getDashboardScans(req, res, next) {
  try {
    const result = await getDashboardScansService();

    return successResponse(res, result, "Dashboard scans retrieved");
  } catch (error) {
    next(error);
  }
}

export async function getDashboardScan(req, res, next) {
  try {
    const scanId = req.params.scanId?.toString().trim();

    if (!scanId) {
      throw new AppError("scanId is required", 400);
    }

    const result = await getDashboardScanService(scanId);

    return successResponse(res, result, "Dashboard scan retrieved");
  } catch (error) {
    next(error);
  }
}
