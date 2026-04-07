import { errorResponse } from "../utils/response.js";

// Wraps async route handlers to forward errors to global handler
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Global error middleware — must be registered last in server.js
export const globalErrorHandler = (err, req, res, _next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((e) => e.message).join(", ");
    return errorResponse(res, message, 400);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return errorResponse(res, `${field} already exists`, 409);
  }

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    return errorResponse(res, "Invalid ID format", 400);
  }

  return errorResponse(res, err.message || "Internal server error", err.statusCode || 500, err);
};
