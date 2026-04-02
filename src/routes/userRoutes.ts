import { Router } from "express";
import { createUser, listUsers, updateUserRole, updateUserStatus } from "../controllers/userController";
import { requireAuth } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/roleMiddleware";
import { validateRequest } from "../middlewares/validateRequest";
import { createUserSchema, updateRoleSchema, updateStatusSchema } from "../validators/userValidators";

const router = Router();

router.use(requireAuth, requireRole("admin"));
router.post("/", validateRequest(createUserSchema), createUser);
router.get("/", listUsers);
router.patch("/:id/role", validateRequest(updateRoleSchema), updateUserRole);
router.patch("/:id/status", validateRequest(updateStatusSchema), updateUserStatus);

export default router;
