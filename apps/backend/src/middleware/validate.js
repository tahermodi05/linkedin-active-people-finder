import { ZodError } from "zod";

export function validate(schema) {
  return (req, res, next) => {

    try {
      req.validatedData = schema.parse(req.body);

      next();
    } catch (error) {

      if (error instanceof ZodError) {
        const requestId = req.requestId || req.headers["x-request-id"] || "unknown";

        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
          requestId,
        });
      }

      next(error);
    }
  };
}