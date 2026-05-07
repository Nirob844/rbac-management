import { FastifyPluginAsync } from "fastify";
import * as permissionController from "./permission.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { hasRole } from "../../middlewares/rbac.middleware";

export const permissionRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("preHandler", authenticate);
  app.addHook("preHandler", hasRole("admin"));

  app.get("/", permissionController.list);
  app.post("/", permissionController.create);
  app.post("/assign", permissionController.assign);
};

export default permissionRoutes;
