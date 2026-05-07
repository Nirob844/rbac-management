import Fastify, { FastifyInstance } from "fastify";
import fjwt from "@fastify/jwt";
import { config } from "./config/env";
import { setupErrorHandler } from "./middlewares/errorHandler";
import { setupRequestLogger } from "./middlewares/requestLogger";
import { registerHealthRoutes } from "./routes/health";

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

  return app;
}
