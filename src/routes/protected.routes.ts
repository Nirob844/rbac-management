import { FastifyPluginAsync } from "fastify";
import { authenticate } from "../middlewares/auth.middleware";
import { hasPermission, hasRole } from "../middlewares/rbac.middleware";
import { successResponse } from "../utils/response";

export const protectedRoutes: FastifyPluginAsync = async (app) => {
  app.get("/me", { preHandler: [authenticate] }, async (req, reply) => {
    return reply.send(successResponse(req.authUser, "Authenticated profile"));
  });

  app.get(
    "/admin-dashboard",
    { preHandler: [authenticate, hasRole("admin")] },
    async (_req, reply) => {
      return reply.send(
        successResponse({ section: "admin" }, "Admin access granted"),
      );
    },
  );

  app.delete(
    "/posts/:id",
    { preHandler: [authenticate, hasPermission("post:delete")] },
    async (req, reply) => {
      const { id } = req.params as { id: string };
      return reply.send(
        successResponse({ postId: id }, "Post delete permission granted"),
      );
    },
  );

  app.post(
    "/posts",
    { preHandler: [authenticate, hasPermission("post:create")] },
    async (_req, reply) => {
      return reply
        .status(201)
        .send(
          successResponse({ id: "demo" }, "Post create permission granted"),
        );
    },
  );
};

export default protectedRoutes;
