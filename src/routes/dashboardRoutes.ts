import { Router } from "express";
import { getForecast, getInsights, getSummary, getTrends } from "../controllers/dashboardController";
import { requireAuth } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/roleMiddleware";
import { validateRequest } from "../middlewares/validateRequest";
import { forecastQuerySchema, trendQuerySchema } from "../validators/dashboardValidators";

const router = Router();

router.use(requireAuth, requireRole("viewer", "analyst", "admin"));
router.get("/summary", getSummary);
router.get("/trends", validateRequest(trendQuerySchema), getTrends);
router.get("/insights", getInsights);
router.get("/forecast", validateRequest(forecastQuerySchema), getForecast);

export default router;
