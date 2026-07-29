import { errorResponse } from "../utils/response.js";
import { AppError } from "../errors/AppError.js";

export function errorHandler(err, req, res, next) {
  console.error(err);

  if (err instanceof AppError) {
    return errorResponse(
      res,
      err.message,
      [],
      err.statusCode
    );
  }

  return errorResponse(
    res,
    "Internal Server Error",
    [],
    500
  );
}