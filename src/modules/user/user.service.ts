import { prisma } from "../../db/prisma";
import { hashPassword } from "../../utils/hash";
import {
  ConflictError,
  InternalServerError,
  NotFoundError,
} from "../../utils/errors";
import { CreateUserInput, UpdateUserInput } from "./user.schema";

const userSelect = {
  id: true,
  email: true,
  username: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const listUsers = async () => {
  try {
    return await prisma.user.findMany({
      select: userSelect,
      orderBy: { createdAt: "desc" },
    });
  } catch {
    throw new InternalServerError("Failed to fetch users");
  }
};

export const getUserById = async (id: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });

    if (!user) {
      throw new NotFoundError("User");
    }

    return user;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new InternalServerError("Failed to fetch user");
  }
};

export const createUser = async (input: CreateUserInput) => {
  try {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: input.email }, { username: input.username }],
      },
    });

    if (existing?.email === input.email) {
      throw new ConflictError("Email already in use");
    }

    if (existing?.username === input.username) {
      throw new ConflictError("Username already in use");
    }

    const password = await hashPassword(input.password);

    return await prisma.user.create({
      data: {
        username: input.username,
        email: input.email,
        password,
        isActive: input.isActive ?? true,
      },
      select: userSelect,
    });
  } catch (error) {
    if (error instanceof ConflictError) {
      throw error;
    }
    throw new InternalServerError("Failed to create user");
  }
};

export const updateUser = async (id: string, input: UpdateUserInput) => {
  try {
    await getUserById(id);

    if (input.email !== undefined || input.username !== undefined) {
      const conflict = await prisma.user.findFirst({
        where: {
          id: { not: id },
          OR: [
            ...(input.email !== undefined ? [{ email: input.email }] : []),
            ...(input.username !== undefined
              ? [{ username: input.username }]
              : []),
          ],
        },
      });

      if (conflict?.email === input.email) {
        throw new ConflictError("Email already in use");
      }

      if (conflict?.username === input.username) {
        throw new ConflictError("Username already in use");
      }
    }

    const data: {
      username?: string;
      email?: string;
      password?: string;
      isActive?: boolean;
    } = {};

    if (input.username !== undefined) data.username = input.username;
    if (input.email !== undefined) data.email = input.email;
    if (input.isActive !== undefined) data.isActive = input.isActive;
    if (input.password !== undefined) {
      data.password = await hashPassword(input.password);
    }

    return await prisma.user.update({
      where: { id },
      data,
      select: userSelect,
    });
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ConflictError) {
      throw error;
    }
    throw new InternalServerError("Failed to update user");
  }
};

export const deleteUser = async (id: string) => {
  try {
    await getUserById(id);
    await prisma.user.delete({
      where: { id },
    });

    return null;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new InternalServerError("Failed to delete user");
  }
};
