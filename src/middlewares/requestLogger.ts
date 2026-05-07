import { FastifyInstance } from "fastify";

declare module "fastify" {
  interface FastifyRequest {
    startTime?: number;
  }
}

/**
 * Setup request logging middleware
 */
export async function setupRequestLogger(app: any): Promise<void> {
  app.addHook("onRequest", async (request: any, reply: any) => {
    request.startTime = Date.now();
  });

  app.addHook("onResponse", async (request: any, reply: any) => {
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
