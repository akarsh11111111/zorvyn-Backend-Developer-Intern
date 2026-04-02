import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { userService } from "../services/userService";
import { toSafeUser } from "../models/userModel";
import { auditService } from "../services/auditService";

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;
  const user = await userService.createUser({ name, email, password, role });

  await auditService.log({
    actor: req.user!,
    action: "user.create",
    entityType: "user",
    entityId: user.id,
    metadata: { createdEmail: user.email, createdRole: user.role }
  });

  res.status(201).json({
    success: true,
    data: toSafeUser(user)
  });
});

export const listUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await userService.listUsers();

  res.status(200).json({
    success: true,
    data: users.map(toSafeUser)
  });
});

export const updateUserRole = asyncHandler(async (req: Request, res: Response) => {
  const userId = String(req.params.id);
  const user = await userService.updateUserRole(userId, req.body.role);

  await auditService.log({
    actor: req.user!,
    action: "user.updateRole",
    entityType: "user",
    entityId: user.id,
    metadata: { updatedRole: user.role }
  });

  res.status(200).json({
    success: true,
    data: toSafeUser(user)
  });
});

export const updateUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const userId = String(req.params.id);
  const user = await userService.updateUserStatus(userId, req.body.isActive);

  await auditService.log({
    actor: req.user!,
    action: "user.updateStatus",
    entityType: "user",
    entityId: user.id,
    metadata: { isActive: user.isActive }
  });

  res.status(200).json({
    success: true,
    data: toSafeUser(user)
  });
});
