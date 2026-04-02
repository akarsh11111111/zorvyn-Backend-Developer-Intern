import { Router } from "express";
import { listAudits } from "../controllers/auditController";
import { requireAuth } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/roleMiddleware";
import { validateRequest } from "../middlewares/validateRequest";
import { listAuditsSchema } from "../validators/auditValidators";

const router = Router();

router.use(requireAuth, requireRole("admin"));
router.get("/", validateRequest(listAuditsSchema), listAudits);

export default router;