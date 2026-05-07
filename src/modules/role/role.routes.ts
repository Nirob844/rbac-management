import { FastifyPluginAsync } from "fastify";
import * as roleController from "./role.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { hasRole } from "../../middlewares/rbac.middleware";

export const roleRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("preHandler", authenticate);
  app.addHook("preHandler", hasRole("admin"));

  app.get("/", roleController.list);
  app.post("/", roleController.create);
  app.post("/assign", roleController.assign);
};

export default roleRoutes;
