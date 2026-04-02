import crypto from "crypto";
import { NextFunction, Request, Response } from "express";

const REQUEST_ID_PATTERN = /^[A-Za-z0-9._-]{8,128}$/;

function resolveRequestId(incoming: string | undefined): string {
  if (!incoming) {
    return crypto.randomUUID();
  }

  const candidate = incoming.trim();

  if (!REQUEST_ID_PATTERN.test(candidate)) {
    return crypto.randomUUID();
  }

  return candidate;
}

export function requestContext(req: Request, res: Response, next: NextFunction) {
  const requestId = resolveRequestId(req.header("x-request-id") ?? undefined);

  req.requestId = requestId;
  req.requestStartTimeMs = Date.now();
  res.setHeader("x-request-id", requestId);

  next();
}