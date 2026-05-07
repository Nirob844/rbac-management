import { prisma } from "../../db/prisma";
import { hashPassword, comparePassword } from "../../utils/hash";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/token";
import { RegisterInput, LoginInput } from "./auth.schema";
import {
  ConflictError,
  AuthError,
  NotFoundError,
  InternalServerError,
} from "../../utils/errors";

export const registerUser = async (input: RegisterInput) => {
  try {
    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: input.email },
    });
    if (existing) throw new ConflictError("Email already in use");

    // Hash password
    const hashedPassword = await hashPassword(input.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: input.email,
        username: input.username,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
      },
    });

    return user;
  } catch (err) {
    // Surface known AppErrors, wrap unknowns
    if (err instanceof ConflictError) throw err;
    throw new InternalServerError("Failed to register user");
  }
};

export const loginUser = async (input: LoginInput) => {
  try {
    // Lookup user with roles
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      include: { userRoles: { include: { role: true } } },
    });
    if (!user) throw new AuthError("Invalid credentials");

    // Verify password
    const isValid = await comparePassword(input.password, user.password);
    if (!isValid) throw new AuthError("Invalid credentials");

    // Ensure account active
    if (!user.isActive) throw new AuthError("Account is disabled");

    // Build roles and payload
    const roles = user.userRoles.map((ur) => ur.role.name);
    const payload = { userId: user.id, email: user.email, roles };

    // Generate tokens
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Persist refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, username: user.username, roles },
    };
  } catch (err) {
    if (err instanceof AuthError) throw err;
    throw new InternalServerError("Login failed");
  }
};

export const refreshTokens = async (token: string) => {
  try {
    // Verify refresh token signature and payload
    const payload = verifyRefreshToken(token);

    // Load user and verify stored token
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { userRoles: { include: { role: true } } },
    });
    if (!user || user.refreshToken !== token)
      throw new AuthError("Invalid refresh token");

    const roles = user.userRoles.map((ur) => ur.role.name);
    const newPayload = { userId: user.id, email: user.email, roles };

    const accessToken = generateAccessToken(newPayload);
    const refreshToken = generateRefreshToken(newPayload);

    // Persist new refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return { accessToken, refreshToken };
  } catch (err) {
    if (err instanceof AuthError) throw err;
    throw new InternalServerError("Failed to refresh tokens");
  }
};

export const logoutUser = async (userId: string) => {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  } catch (err) {
    // If user not found, surface a NotFoundError
    throw new NotFoundError("User not found");
  }
};
