import { env } from "../config/env";
import { userService } from "../services/userService";

export async function bootstrapDefaultAdmin(): Promise<void> {
  const existing = await userService.getUserByEmail(env.defaultAdminEmail);

  if (existing) {
    return;
  }

  await userService.createUser({
    name: env.defaultAdminName,
    email: env.defaultAdminEmail,
    password: env.defaultAdminPassword,
    role: "admin"
  });
}
