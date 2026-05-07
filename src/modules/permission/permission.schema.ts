import { z } from "zod";

export const createPermissionSchema = z.object({
  action: z.string().min(2).max(50),
  subject: z.string().min(2).max(50),
  description: z.string().max(255).optional(),
});

export const assignPermissionSchema = z.object({
  roleId: z.string().uuid(),
  permissionId: z.string().uuid(),
});

export type CreatePermissionInput = z.infer<typeof createPermissionSchema>;
export type AssignPermissionInput = z.infer<typeof assignPermissionSchema>;
