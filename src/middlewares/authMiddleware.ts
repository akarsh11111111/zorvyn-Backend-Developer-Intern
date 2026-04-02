import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiError";
import { verifyToken } from "../utils/token";
import { userService } from "../services/userService";

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Authorization token missing");
  }

  const token = authHeader.split(" ")[1];
  const payload = verifyToken(token);

  const user = await userService.getUserById(payload.id);

  if (!user.isActive) {
    throw new ApiError(403, "User is inactive");
  }

  req.user = {
    id: user.id,
    email: user.email,
    role: user.role
  };

  next();
}
