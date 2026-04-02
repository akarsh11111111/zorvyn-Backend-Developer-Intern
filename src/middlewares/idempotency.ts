import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { ApiError } from "../utils/apiError";
import { idempotencyService } from "../services/idempotencyService";

function hashPayload(payload: unknown): string {
  return crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

export function enforceIdempotency(namespace: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const rawKey = req.header("idempotency-key");

    if (!rawKey) {
      throw new ApiError(400, "Missing idempotency-key header");
    }

    const key = `${namespace}:${req.user?.id ?? "anonymous"}:${rawKey}`;
    const requestHash = hashPayload({ body: req.body, params: req.params, query: req.query });
    const existing = idempotencyService.get(key);

    if (existing) {
      if (existing.requestHash !== requestHash) {
        throw new ApiError(409, "Idempotency key already used with different payload");
      }

      res.setHeader("x-idempotent-replay", "true");
      return res.status(existing.response.statusCode).json(existing.response.body);
    }

    const originalJson = res.json.bind(res);
    res.json = ((body: unknown) => {
      idempotencyService.set(
        key,
        requestHash,
        {
          statusCode: res.statusCode,
          body
        },
        env.idempotencyTtlMs
      );

      return originalJson(body);
    }) as Response["json"];

    next();
  };
}