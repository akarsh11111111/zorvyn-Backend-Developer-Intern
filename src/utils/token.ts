import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AuthUser } from "../types/domain";

export function signToken(payload: AuthUser): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"] });
}

export function verifyToken(token: string): AuthUser {
  return jwt.verify(token, env.jwtSecret) as AuthUser;
}
