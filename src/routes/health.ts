import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { checkDatabaseHealth } from "../db/connection";

/**
 * Register health check routes
 */
export async function registerHealthRoutes(app: any): Promise<void> {
  app.get("/health", async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.send({
      success: true,
      message: "RBAC server is running 🚀",
      timestamp: new Date().toISOString(),
    });
  });

  // Detailed health check with database status
  app.get(
    "/health/detailed",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const dbHealth = await checkDatabaseHealth();
      const statusCode = dbHealth ? 200 : 503;
      return reply.code(statusCode).send({
        success: dbHealth,
        message: dbHealth ? "All systems operational" : "Database unavailable",
        timestamp: new Date().toISOString(),
        services: {
          database: dbHealth ? "healthy" : "unhealthy",
          server: "healthy",
        },
      });
    },
  );
}
