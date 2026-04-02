import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { authService } from "../services/authService";
import { toSafeUser } from "../models/userModel";
import { auditService } from "../services/auditService";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;
  const result = await authService.register({ name, email, password, role });

  await auditService.log({
    actor: {
      id: result.user.id,
      email: result.user.email,
      role: result.user.role
    },
    action: "auth.register",
    entityType: "auth",
    entityId: result.user.id,
    metadata: { email: result.user.email }
  });

  res.status(201).json({
    success: true,
    data: {
      user: toSafeUser(result.user),
      token: result.token
    }
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);

  await auditService.log({
    actor: {
      id: result.user.id,
      email: result.user.email,
      role: result.user.role
    },
    action: "auth.login",
    entityType: "auth",
    entityId: result.user.id,
    metadata: { email: result.user.email }
  });

  res.status(200).json({
    success: true,
    data: {
      user: toSafeUser(result.user),
      token: result.token
    }
  });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: req.user
  });
});
