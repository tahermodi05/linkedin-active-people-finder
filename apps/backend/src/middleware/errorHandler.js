import { AppError } from "../errors/AppError.js";

export function errorHandler(err, req, res, next) {
  const requestId = req.requestId || req.headers["x-request-id"] || "unknown";
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err instanceof AppError ? err.message : "Internal Server Error";
  const errors = Array.isArray(err?.errors) && err.errors.length > 0
    ? err.errors
    : [];

  console.error(JSON.stringify({
    level: "error",
    event: "request_error",
    requestId,
    method: req.method,
    path: req.originalUrl || req.url,
    statusCode,
    message,
    errorName: err?.name || "Error",
    stack: err?.stack,
  }));

  return res.status(statusCode).json({
    success: false,
    message,
    errors,
    requestId,
  });
}