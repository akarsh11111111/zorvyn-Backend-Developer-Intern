import { z } from "zod";

export const createRecordSchema = z.object({
  body: z.object({
    amount: z.number().positive(),
    type: z.enum(["income", "expense"]),
    category: z.string().min(2),
    date: z.iso.date(),
    notes: z.string().max(500).optional()
  })
});

export const updateRecordSchema = z.object({
  params: z.object({
    id: z.uuid()
  }),
  body: z.object({
    amount: z.number().positive().optional(),
    type: z.enum(["income", "expense"]).optional(),
    category: z.string().min(2).optional(),
    date: z.iso.date().optional(),
    notes: z.string().max(500).optional(),
    expectedVersion: z.number().int().positive().optional()
  })
});

export const listRecordsSchema = z.object({
  query: z.object({
    type: z.enum(["income", "expense"]).optional(),
    category: z.string().optional(),
    fromDate: z.iso.date().optional(),
    toDate: z.iso.date().optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional()
  })
});

export const recordIdSchema = z.object({
  params: z.object({
    id: z.uuid()
  })
});
