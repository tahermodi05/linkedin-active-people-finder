import {
  searchPeople,
  getLatestScan as getLatestScanService,
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