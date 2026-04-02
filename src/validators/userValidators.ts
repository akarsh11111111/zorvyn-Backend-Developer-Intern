import { z } from "zod";

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.email(),
    password: z.string().min(8),
    role: z.enum(["viewer", "analyst", "admin"])
  })
});

export const updateRoleSchema = z.object({
  body: z.object({
    role: z.enum(["viewer", "analyst", "admin"])
  }),
  params: z.object({
    id: z.uuid()
  })
});

export const updateStatusSchema = z.object({
  body: z.object({
    isActive: z.boolean()
  }),
  params: z.object({
    id: z.uuid()
  })
});
