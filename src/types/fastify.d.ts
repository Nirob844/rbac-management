import "fastify";
import type { JwtPayload } from "../utils/token";

declare module "fastify" {
  interface FastifyRequest {
    authUser?: JwtPayload;
  }
}
