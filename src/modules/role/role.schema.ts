import { z } from "zod";

export const createRoleSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().max(255).optional(),
});

export const assignRoleSchema = z.object({
  userId: z.string().uuid(),
  roleId: z.string().uuid(),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type AssignRoleInput = z.infer<typeof assignRoleSchema>;
