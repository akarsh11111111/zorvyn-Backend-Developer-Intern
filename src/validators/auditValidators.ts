import { z } from "zod";

export const listAuditsSchema = z.object({
  query: z.object({
    actorId: z.uuid().optional(),
    action: z.string().min(2).optional(),
    fromDate: z.iso.date().optional(),
    toDate: z.iso.date().optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional()
  })
});