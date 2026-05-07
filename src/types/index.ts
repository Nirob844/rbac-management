import { FastifyRequest } from "fastify";

export interface JwtPayload {
  userId: string;
  email: string;
  roles: string[];
}

export interface AuthenticatedRequest extends FastifyRequest {
  user: JwtPayload;
}
