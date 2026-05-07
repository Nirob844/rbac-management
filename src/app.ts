import Fastify, { FastifyInstance } from "fastify";
import fjwt from "@fastify/jwt";
import { config } from "./config/env";
import { setupErrorHandler } from "./middlewares/errorHandler";
import { setupRequestLogger } from "./middlewares/requestLogger";
import { registerHealthRoutes } from "./routes/health";
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/user/user.routes";
import roleRoutes from "./modules/role/role.routes";
import permissionRoutes from "./modules/permission/permission.routes";
import protectedRoutes from "./routes/protected.routes";

export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger: {
      level: config.logLevel,
      transport:
        config.nodeEnv !== "production"
          ? {
              target: "pino-pretty",
              options: {
                colorize: true,
                translateTime: "SYS:standard",
                ignore: "pid,hostname",
              },
            }
          : undefined,
    },
    disableRequestLogging: true,
    genReqId: () => crypto.randomUUID(),
  });

  app.register(fjwt, {
    secret: config.jwtSecret,
  });

  setupRequestLogger(app);
  setupErrorHandler(app);

  app.register(registerHealthRoutes, { prefix: "/api" });
  app.register(authRoutes, { prefix: "/api/auth" });
  app.register(userRoutes, { prefix: "/api/users" });
  app.register(roleRoutes, { prefix: "/api/roles" });
  app.register(permissionRoutes, { prefix: "/api/permissions" });
  app.register(protectedRoutes, { prefix: "/api/protected" });

  return app;
}
