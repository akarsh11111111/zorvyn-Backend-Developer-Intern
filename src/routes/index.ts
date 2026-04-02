import { Router } from "express";
import authRoutes from "./authRoutes";
import userRoutes from "./userRoutes";
import recordRoutes from "./recordRoutes";
import dashboardRoutes from "./dashboardRoutes";
import auditRoutes from "./auditRoutes";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Finance backend is running"
  });
});

router.get("/permissions", (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      viewer: ["dashboard:read"],
      analyst: ["dashboard:read", "records:read"],
      admin: [
        "dashboard:read",
        "records:read",
        "records:create",
        "records:update",
        "records:delete",
        "users:create",
        "users:read",
        "users:update",
        "audits:read"
      ]
    }
  });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/records", recordRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/audits", auditRoutes);

export default router;
