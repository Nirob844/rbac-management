import { FastifyInstance } from "fastify";

declare module "fastify" {
  interface FastifyRequest {
    startTime?: number;
  }
}

/**
 * Setup request logging middleware
 */
export function setupRequestLogger(app: FastifyInstance): void {
  app.addHook("onRequest", async (request) => {
    request.startTime = Date.now();
  });

  app.addHook("onResponse", async (request, reply) => {
    const duration = Date.now() - (request.startTime as number);
    const logLevel = reply.statusCode >= 400 ? "warn" : "info";

    app.log[logLevel](
      {
        method: request.method,
        path: request.url,
        statusCode: reply.statusCode,
        duration: `${duration}ms`,
        requestId: request.id,
      },
      `${request.method} ${request.url} - ${reply.statusCode} (${duration}ms)`,
    );
  });
}
