import { userService } from "./userService";
import { ApiError } from "../utils/apiError";
import { verifyPassword } from "../utils/password";
import { signToken } from "../utils/token";
import { AuthUser, Role } from "../types/domain";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: Role;
}

export class AuthService {
  async register(input: RegisterInput, forceRole?: Role) {
    const role = forceRole ?? input.role ?? "viewer";
    const user = await userService.createUser({
      name: input.name,
      email: input.email,
      password: input.password,
      role
    });

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    return {
      user,
      token: signToken(authUser)
    };
  }

  async login(email: string, password: string) {
    const user = await userService.getUserByEmail(email);

    if (!user) {
      throw new ApiError(401, "Invalid credentials");
    }

    if (!user.isActive) {
      throw new ApiError(403, "User is inactive");
    }

    const valid = await verifyPassword(password, user.passwordHash);

    if (!valid) {
      throw new ApiError(401, "Invalid credentials");
    }

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    return {
      user,
      token: signToken(authUser)
    };
  }
}

export const authService = new AuthService();
