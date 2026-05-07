import { FastifyReply, FastifyRequest } from "fastify";
import { AuthError } from "../utils/errors";
import { verifyAccessToken } from "../utils/token";

export const authenticate = async (
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> => {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    throw new AuthError("Unauthorized");
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    throw new AuthError("Unauthorized");
  }

  try {
    const payload = verifyAccessToken(token);
    request.authUser = payload;
  } catch {
    throw new AuthError("Invalid or expired token");
  }
};
