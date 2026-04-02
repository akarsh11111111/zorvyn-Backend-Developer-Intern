import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { dashboardService } from "../services/dashboardService";

export const getSummary = asyncHandler(async (_req: Request, res: Response) => {
  const summary = await dashboardService.getSummary();

  res.status(200).json({
    success: true,
    data: summary
  });
});

export const getTrends = asyncHandler(async (req: Request, res: Response) => {
  const period = (req.query.period as "monthly" | "weekly" | undefined) ?? "monthly";
  const trends = await dashboardService.getTrends(period);

  res.status(200).json({
    success: true,
    data: trends
  });
});

export const getInsights = asyncHandler(async (_req: Request, res: Response) => {
  const insights = await dashboardService.getInsights();

  res.status(200).json({
    success: true,
    data: insights
  });
});

export const getForecast = asyncHandler(async (req: Request, res: Response) => {
  const monthsAhead = req.query.monthsAhead ? Number(req.query.monthsAhead) : 1;
  const forecast = await dashboardService.getForecast(monthsAhead);

  res.status(200).json({
    success: true,
    data: forecast
  });
});
