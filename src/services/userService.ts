import crypto from "crypto";
import { persistence } from "../config/persistence";
import { Role, User } from "../types/domain";
import { ApiError } from "../utils/apiError";
import { hashPassword } from "../utils/password";

interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export class UserService {
  async listUsers(): Promise<User[]> {
    const store = await persistence.read();
    return store.users;
  }

  async getUserById(id: string): Promise<User> {
    const store = await persistence.read();
    const user = store.users.find((item) => item.id === id);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const store = await persistence.read();
    return store.users.find((item) => item.email.toLowerCase() === email.toLowerCase());
  }

  async createUser(input: CreateUserInput): Promise<User> {
    const store = await persistence.read();

    const existing = store.users.find((item) => item.email.toLowerCase() === input.email.toLowerCase());

    if (existing) {
      throw new ApiError(409, "Email already exists");
    }

    const now = new Date().toISOString();
    const user: User = {
      id: crypto.randomUUID(),
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash: await hashPassword(input.password),
      role: input.role,
      isActive: true,
      createdAt: now,
      updatedAt: now
    };

    store.users.push(user);
    await persistence.write(store);

    return user;
  }

  async updateUserRole(id: string, role: Role): Promise<User> {
    const store = await persistence.read();
    const user = store.users.find((item) => item.id === id);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    user.role = role;
    user.updatedAt = new Date().toISOString();

    await persistence.write(store);

    return user;
  }

  async updateUserStatus(id: string, isActive: boolean): Promise<User> {
    const store = await persistence.read();
    const user = store.users.find((item) => item.id === id);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    user.isActive = isActive;
    user.updatedAt = new Date().toISOString();

    await persistence.write(store);

    return user;
  }
}

export const userService = new UserService();
