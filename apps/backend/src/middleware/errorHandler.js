import { errorResponse } from "../utils/response.js";

export function errorHandler(err, req, res, next) {
  console.error(err);

  return errorResponse(
    res,
    "Internal Server Error",
    [],
    500
  );
}