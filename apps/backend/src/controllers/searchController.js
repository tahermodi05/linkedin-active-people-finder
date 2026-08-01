import {
  searchPeople,
  getLatestScan as getLatestScanService,
  getNextProfileForVerification,
  completeCurrentVerification as completeCurrentVerificationService,
} from "../services/searchService.js";

import { successResponse } from "../utils/response.js";

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

export async function getNextProfile(req, res, next) {
  try {
    const result = await getNextProfileForVerification();

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