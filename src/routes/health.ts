import { FastifyPluginAsync } from "fastify";
import { checkDatabaseHealth } from "../db/connection";

/**
 * Register health check routes
 */
export const registerHealthRoutes: FastifyPluginAsync = async (app) => {
  app.get("/health", async () => {
    return {
      success: true,
      message: "RBAC server is running 🚀",
      timestamp: new Date().toISOString(),
    };
  });
  app.get("/nirob", async () => {
    return {
      success: true,
      message: "RBAC server is running 🚀",
      data: {
        name: "Nirob",
        age: 24,
        profession: "Software Engineer",
      },
      timestamp: new Date().toISOString(),
    };
  });
  app.get("/fahim", async () => {
    return {
      success: true,
      message: "RBAC server is running 🚀",
      data: {
        name: "Fahim",
        age: 24,
        profession: "Software Engineer",
      },
      timestamp: new Date().toISOString(),
    };
  });
  app.get("/sazzad", async () => {
    return {
      success: true,
      message: "RBAC server is running 🚀",
      data: {
        name: "Sazzad",
        age: 24,
        profession: "Software Engineer",
      },
      timestamp: new Date().toISOString(),
    };
  });

  // Detailed health check with database status
  app.get("/health/detailed", async (_request, reply) => {
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
  });
};
