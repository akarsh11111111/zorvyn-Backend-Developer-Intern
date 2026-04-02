import { NextFunction, Request, Response } from "express";
import { ZodTypeAny } from "zod";
import { ApiError } from "../utils/apiError";

export function validateRequest(schema: ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query
    });

    if (!result.success) {
      const firstIssue = result.error.issues[0];
      throw new ApiError(400, `${firstIssue.path.join(".")}: ${firstIssue.message}`);
    }

    next();
  };
}
