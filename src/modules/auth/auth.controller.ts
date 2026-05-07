import { FastifyRequest, FastifyReply } from "fastify";
import { registerSchema, loginSchema } from "./auth.schema";
import * as authService from "./auth.service";
import { AuthError } from "../../utils/errors";
import { successResponse } from "../../utils/response";

export const register = async (req: FastifyRequest, reply: FastifyReply) => {
  const input = registerSchema.parse(req.body);
  const user = await authService.registerUser(input);
  return reply.status(201).send(successResponse(user, "User created"));
};

export const login = async (req: FastifyRequest, reply: FastifyReply) => {
  const input = loginSchema.parse(req.body);
  const result = await authService.loginUser(input);
  return reply.send(successResponse(result, "Login successful"));
};

export const refresh = async (req: FastifyRequest, reply: FastifyReply) => {
  const { refreshToken } = req.body as { refreshToken: string };
  if (!refreshToken) {
    return reply
      .status(400)
      .send({ success: false, message: "Refresh token required" });
  }
  const tokens = await authService.refreshTokens(refreshToken);
  return reply.send(successResponse(tokens, "Tokens refreshed"));
};

export const logout = async (req: FastifyRequest, reply: FastifyReply) => {
  const user = req.authUser;
  if (!user) {
    throw new AuthError("Unauthorized");
  }

  await authService.logoutUser(user.userId);
  return reply.send(successResponse(null, "Logged out successfully"));
};

export const me = async (req: FastifyRequest, reply: FastifyReply) => {
  const user = req.authUser;
  if (!user) {
    throw new AuthError("Unauthorized");
  }

  return reply.send(successResponse(user, "Authenticated user"));
};

export const adminOnly = async (_req: FastifyRequest, reply: FastifyReply) => {
  return reply.send(successResponse(null, "Admin access granted"));
};

export const deletePost = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as { id: string };
  return reply.send(
    successResponse({ postId: id }, "Permission check passed for post delete"),
  );
};
