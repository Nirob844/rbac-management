import { buildApp } from "./app";
import { config } from "./config/env";
import { closeDatabase, initializeDatabase } from "./db/connection";

const app = buildApp();

async function start(): Promise<void> {
  try {
    console.log("🔌 Connecting to database...");
    await initializeDatabase();

    console.log("🚀 Starting server...");
    await app.listen({ host: config.host, port: config.port });

    app.log.info(
      `Server running at http://${config.host === "0.0.0.0" ? "localhost" : config.host}:${config.port}`,
    );
  } catch (error) {
    app.log.error(error, "Failed to start server");
    await closeDatabase();
    process.exit(1);
  }
}

async function shutdown(signal: string): Promise<void> {
  app.log.info(`${signal} received, shutting down gracefully`);

  try {
    await app.close();
    await closeDatabase();
    process.exit(0);
  } catch (error) {
    app.log.error(error, "Error during shutdown");
    process.exit(1);
  }
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));

void start();