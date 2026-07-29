export function successResponse(
  res,
  data = null,
  message = "Success",
  statusCode = 200
) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function errorResponse(
  res,
  message = "Something went wrong",
  errors = [],
  statusCode = 500
) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
}

export function createdResponse(
  res,
  data = null,
  message = "Created successfully"
) {
  return successResponse(res, data, message, 201);
}