import { FastifyPluginAsync } from "fastify";
import * as userController from "./user.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { hasRole } from "../../middlewares/rbac.middleware";

export const userRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("preHandler", authenticate);
  app.addHook("preHandler", hasRole("admin"));

  app.get("/", userController.list);
  app.get("/:id", userController.getById);
  app.post("/", userController.create);
  app.patch("/:id", userController.update);
  app.delete("/:id", userController.remove);
};

export default userRoutes;
