import {
  searchPeople,
  getLatestScan as getLatestScanService,
  getScanResults as getScanResultsService,
  getScanById as getScanByIdService,
  getNextProfileForVerification,
  completeCurrentVerification as completeCurrentVerificationService,
} from "../services/searchService.js";

import { AppError } from "../errors/AppError.js";
import { successResponse, errorResponse } from "../utils/response.js";

export async function search(req, res, next) {
  try {
    const result = await searchPeople(req.validatedData);

    return successResponse(
      res,
      result,
      "Search completed"
    );
  } catch (error) {
    next(error);
  }
}

export async function getLatestScan(req, res, next) {
  try {
    const result = await getLatestScanService();

    return successResponse(
      res,
      result,
      "Latest scan retrieved"
    );
  } catch (error) {
    next(error);
  }
}

export async function getScanResults(req, res, next) {
  try {
    const scanId = req.query?.scanId?.toString().trim();

    if (scanId) {
      const result = await getScanByIdService(scanId);

      if (!result) {
        return errorResponse(res, "Scan not found", [], 404);
      }

      return successResponse(res, result, "Scan results retrieved");
    }

    const result = await getScanResultsService();

    return successResponse(
      res,
      result,
      "Scan results retrieved"
    );
  } catch (error) {
    next(error);
  }
}

export async function getNextProfile(req, res, next) {
  try {
    const scanId = req.query?.scanId?.toString().trim();

    if (!scanId) {
      throw new AppError("scanId is required", 400);
    }

    const result = await getNextProfileForVerification(scanId);

    return successResponse(
      res,
      result,
      "Next profile retrieved"
    );
  } catch (error) {
    next(error);
  }
}

export async function completeCurrentVerification(req, res, next) {
  try {
const result = await completeCurrentVerificationService(req.validatedData);
    return successResponse(
      res,
      result,
      "Profile verification completed"
    );
  } catch (error) {
    next(error);
  }
}
