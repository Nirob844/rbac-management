import { prisma } from "../../db/prisma";
import {
  ConflictError,
  InternalServerError,
  NotFoundError,
} from "../../utils/errors";
import { AssignRoleInput, CreateRoleInput } from "./role.schema";

const roleSelect = {
  id: true,
  name: true,
  description: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const listRoles = async () => {
  try {
    return await prisma.role.findMany({
      select: roleSelect,
      orderBy: { createdAt: "desc" },
    });
  } catch {
    throw new InternalServerError("Failed to fetch roles");
  }
};

export const createRole = async (input: CreateRoleInput) => {
  try {
    const existing = await prisma.role.findUnique({
      where: { name: input.name },
    });

    if (existing) {
      throw new ConflictError("Role already exists");
    }

    return await prisma.role.create({
      data: {
        name: input.name,
        description: input.description,
      },
      select: roleSelect,
    });
  } catch (error) {
    if (error instanceof ConflictError) {
      throw error;
    }
    throw new InternalServerError("Failed to create role");
  }
};

export const assignRoleToUser = async (input: AssignRoleInput) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: input.userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundError("User");
    }

    const role = await prisma.role.findUnique({
      where: { id: input.roleId },
      select: { id: true },
    });

    if (!role) {
      throw new NotFoundError("Role");
    }

    const existing = await prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId: input.userId,
          roleId: input.roleId,
        },
      },
    });

    if (existing) {
      throw new ConflictError("Role already assigned to user");
    }

    return await prisma.userRole.create({
      data: {
        userId: input.userId,
        roleId: input.roleId,
      },
      select: {
        id: true,
        assignedAt: true,
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
        role: {
          select: roleSelect,
        },
      },
    });
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ConflictError) {
      throw error;
    }
    throw new InternalServerError("Failed to assign role to user");
  }
};
