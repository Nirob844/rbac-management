import { z } from "zod";

export const createUserSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  isActive: z.boolean().optional(),
});

export const updateUserSchema = z
  .object({
    username: z.string().min(3).max(20).optional(),
    email: z.string().email().optional(),
    password: z.string().min(6).max(100).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
