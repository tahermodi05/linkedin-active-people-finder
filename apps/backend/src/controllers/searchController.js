import { searchPeople } from "../services/searchService.js";
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