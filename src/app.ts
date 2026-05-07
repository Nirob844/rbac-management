import Fastify from "fastify";
import fjwt from "@fastify/jwt";
import { config } from "./config/env";
import { initializeDatabase, closeDatabase } from "./db/connection";
import { setupErrorHandler } from "./middlewares/errorHandler";
import { setupRequestLogger } from "./middlewares/requestLogger";
import { registerHealthRoutes } from "./routes/health";

const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || "info",
    transport:
      process.env.NODE_ENV !== "production"
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
});

/**
 * Initialize server
 */
const initializeServer = async (): Promise<void> => {
  try {
    // Initialize database connection
    console.log("🔌 Connecting to database...");
    await initializeDatabase();

    // Register plugins
    console.log("📦 Registering plugins...");
    await app.register(fjwt, {
      secret: config.jwtSecret,
    });

    // Setup middleware
    console.log("⚙️  Setting up middleware...");
    await setupRequestLogger(app);
    setupErrorHandler(app);

    // Register routes
    console.log("🛣️  Registering routes...");
    await registerHealthRoutes(app);

    // Start server
    console.log(`🚀 Starting server on http://0.0.0.0:${config.port}...`);
    await app.listen({ port: config.port, host: "0.0.0.0" });
    console.log(`✅ Server running on http://localhost:${config.port}`);
    console.log(`📊 Health check: http://localhost:${config.port}/health`);
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    await closeDatabase();
    process.exit(1);
  }
};

/**
 * Handle graceful shutdown
 */
const gracefulShutdown = async (signal: string): Promise<void> => {
  console.log(`\n${signal} received, shutting down gracefully...`);
  try {
    await app.close();
    await closeDatabase();
    console.log("✅ Server shutdown complete");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error during shutdown:", err);
    process.exit(1);
  }
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

// Start the server
initializeServer();
