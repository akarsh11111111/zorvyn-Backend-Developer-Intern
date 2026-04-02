import { z } from "zod";

export const trendQuerySchema = z.object({
  query: z.object({
    period: z.enum(["monthly", "weekly"]).default("monthly")
  })
});

export const forecastQuerySchema = z.object({
  query: z.object({
    monthsAhead: z.coerce.number().int().min(1).max(6).default(1)
  })
});
