import { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { ApiError } from "../utils/apiError";

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  const baseError = {
    success: false,
    requestId: req.requestId,
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  };

  if (err instanceof ApiError) {
    if (err.statusCode >= 500) {
      console.error("[api_error]", {
        requestId: req.requestId,
        path: req.originalUrl,
        method: req.method,
        statusCode: err.statusCode,
        code: err.code,
        message: err.message
      });
    }

    return res.status(err.statusCode).json({
      ...baseError,
      message: err.message,
      code: err.code,
      details: err.details
    });
  }

  console.error("[unhandled_error]", {
    requestId: req.requestId,
    path: req.originalUrl,
    method: req.method,
    message: err.message,
    stack: err.stack
  });

  return res.status(500).json({
    ...baseError,
    message: "Internal server error",
    ...(env.nodeEnv !== "production" ? { details: err.message } : {})
  });
}
