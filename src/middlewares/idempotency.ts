import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { ApiError } from "../utils/apiError";
import { idempotencyService } from "../services/idempotencyService";

function stableSerialize(value: unknown): string {
  if (value === null || value === undefined) {
    return String(value);
  }

  if (typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableSerialize(item)).join(",")}]`;
  }

  const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b));
  const serializedEntries = entries.map(([key, nestedValue]) => `${JSON.stringify(key)}:${stableSerialize(nestedValue)}`);

  return `{${serializedEntries.join(",")}}`;
}

function hashPayload(payload: unknown): string {
  return crypto.createHash("sha256").update(stableSerialize(payload)).digest("hex");
}

export function enforceIdempotency(namespace: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const rawKey = req.header("idempotency-key")?.trim();

    if (!rawKey) {
      throw new ApiError(400, "Missing idempotency-key header");
    }

    if (rawKey.length < 8 || rawKey.length > 128) {
      throw new ApiError(400, "idempotency-key must be between 8 and 128 characters");
    }

    const key = `${namespace}:${req.user?.id ?? "anonymous"}:${rawKey}`;
    const requestHash = hashPayload({ body: req.body, params: req.params, query: req.query });
    const decision = idempotencyService.begin(key, requestHash, env.idempotencyTtlMs);

    if (decision.type === "conflict") {
      throw new ApiError(409, "Idempotency key already used with different payload", "IDEMPOTENCY_CONFLICT");
    }

    if (decision.type === "in_progress") {
      throw new ApiError(409, "A request with this idempotency key is currently in progress", "IDEMPOTENCY_IN_PROGRESS");
    }

    if (decision.type === "replay") {
      res.setHeader("x-idempotent-replay", "true");
      return res.status(decision.response.statusCode).json(decision.response.body);
    }

    let responseCaptured = false;
    const originalJson = res.json.bind(res);

    res.json = ((body: unknown) => {
      responseCaptured = true;

      if (res.statusCode >= 500) {
        idempotencyService.release(key, requestHash);
      } else {
        idempotencyService.complete(
          key,
          requestHash,
          {
            statusCode: res.statusCode,
            body
          },
          env.idempotencyTtlMs
        );
      }

      return originalJson(body);
    }) as Response["json"];

    res.on("finish", () => {
      if (responseCaptured) {
        return;
      }

      if (res.statusCode >= 500) {
        idempotencyService.release(key, requestHash);
      }
    });

    next();
  };
}