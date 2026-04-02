import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiError";

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      requestId: req.requestId
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
    requestId: req.requestId
  });
}
