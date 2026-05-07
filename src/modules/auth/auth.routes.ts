import { FastifyPluginAsync } from "fastify";
import * as authController from "./auth.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { hasRole, hasPermission } from "../../middlewares/rbac.middleware";

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.post("/register", authController.register);
  app.post("/login", authController.login);
  app.post("/refresh", authController.refresh);
  app.post("/logout", { preHandler: [authenticate] }, authController.logout);

  app.get("/me", { preHandler: [authenticate] }, authController.me);
  app.get(
    "/admin",
    { preHandler: [authenticate, hasRole("admin")] },
    authController.adminOnly,
  );
  app.delete(
    "/posts/:id",
    { preHandler: [authenticate, hasPermission("post:delete")] },
    authController.deletePost,
  );
};

export default authRoutes;
