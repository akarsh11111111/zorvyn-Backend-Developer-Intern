import { Router } from "express";
import { login, me, register } from "../controllers/authController";
import { requireAuth } from "../middlewares/authMiddleware";
import { validateRequest } from "../middlewares/validateRequest";
import { loginSchema, registerSchema } from "../validators/authValidators";

const router = Router();

router.post("/register", validateRequest(registerSchema), register);
router.post("/login", validateRequest(loginSchema), login);
router.get("/me", requireAuth, me);

export default router;
