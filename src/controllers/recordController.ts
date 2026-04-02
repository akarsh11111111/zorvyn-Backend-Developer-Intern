import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { recordService } from "../services/recordService";
import { auditService } from "../services/auditService";

export const createRecord = asyncHandler(async (req: Request, res: Response) => {
  const { amount, type, category, date, notes } = req.body;

  const record = await recordService.createRecord({
    amount,
    type,
    category,
    date,
    notes,
    createdBy: req.user!.id
  });

  await auditService.log({
    actor: req.user!,
    action: "record.create",
    entityType: "record",
    entityId: record.id,
    metadata: { type: record.type, category: record.category, amount: record.amount }
  });

  res.status(201).json({
    success: true,
    data: record,
    meta: {
      version: record.version
    }
  });
});

export const listRecords = asyncHandler(async (req: Request, res: Response) => {
  const result = await recordService.listRecords({
    type: req.query.type as "income" | "expense" | undefined,
    category: req.query.category as string | undefined,
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

export const updateRecord = asyncHandler(async (req: Request, res: Response) => {
  const recordId = String(req.params.id);
  const record = await recordService.updateRecord(recordId, req.body);

  await auditService.log({
    actor: req.user!,
    action: "record.update",
    entityType: "record",
    entityId: record.id,
    metadata: { type: record.type, category: record.category, amount: record.amount }
  });

  res.status(200).json({
    success: true,
    data: record,
    meta: {
      version: record.version
    }
  });
});

export const deleteRecord = asyncHandler(async (req: Request, res: Response) => {
  const recordId = String(req.params.id);
  await recordService.deleteRecord(recordId);

  await auditService.log({
    actor: req.user!,
    action: "record.delete",
    entityType: "record",
    entityId: recordId
  });

  res.status(200).json({
    success: true,
    message: "Record deleted"
  });
});
