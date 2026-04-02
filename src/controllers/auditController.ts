import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { auditService } from "../services/auditService";

export const listAudits = asyncHandler(async (req: Request, res: Response) => {
  const result = await auditService.list({
    actorId: req.query.actorId as string | undefined,
    action: req.query.action as string | undefined,
    fromDate: req.query.fromDate as string | undefined,
    toDate: req.query.toDate as string | undefined,
    page: req.query.page ? Number(req.query.page) : undefined,
    limit: req.query.limit ? Number(req.query.limit) : undefined
  });

  res.status(200).json({
    success: true,
    ...result
  });
});