import { prisma } from "../../db/prisma";
import {
  ConflictError,
  InternalServerError,
  NotFoundError,
} from "../../utils/errors";
import {
  AssignPermissionInput,
  CreatePermissionInput,
} from "./permission.schema";

const permissionSelect = {
  id: true,
  action: true,
  subject: true,
  description: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const listPermissions = async () => {
  try {
    return await prisma.permission.findMany({
      select: permissionSelect,
      orderBy: { createdAt: "desc" },
    });
  } catch {
    throw new InternalServerError("Failed to fetch permissions");
  }
};

export const createPermission = async (input: CreatePermissionInput) => {
  try {
    const existing = await prisma.permission.findUnique({
      where: {
        action_subject: {
          action: input.action,
          subject: input.subject,
        },
      },
    });

    if (existing) {
      throw new ConflictError("Permission already exists");
    }

    return await prisma.permission.create({
      data: {
        action: input.action,
        subject: input.subject,
        description: input.description,
      },
      select: permissionSelect,
    });
  } catch (error) {
    if (error instanceof ConflictError) {
      throw error;
    }
    throw new InternalServerError("Failed to create permission");
  }
};

export const assignPermissionToRole = async (input: AssignPermissionInput) => {
  try {
    const role = await prisma.role.findUnique({
      where: { id: input.roleId },
      select: { id: true },
    });

    if (!role) {
      throw new NotFoundError("Role");
    }

    const permission = await prisma.permission.findUnique({
      where: { id: input.permissionId },
      select: { id: true },
    });

    if (!permission) {
      throw new NotFoundError("Permission");
    }

    const existing = await prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: {
          roleId: input.roleId,
          permissionId: input.permissionId,
        },
      },
    });

    if (existing) {
      throw new ConflictError("Permission already assigned to role");
    }

    return await prisma.rolePermission.create({
      data: {
        roleId: input.roleId,
        permissionId: input.permissionId,
      },
      select: {
        id: true,
        assignedAt: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        permission: {
          select: permissionSelect,
        },
      },
    });
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ConflictError) {
      throw error;
    }
    throw new InternalServerError("Failed to assign permission to role");
  }
};
