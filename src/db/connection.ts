import { prisma } from "./prisma";

/**
 * Initialize database connection
 */
export async function initializeDatabase(): Promise<void> {
  try {
    // Test the connection
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Database connection established");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    throw new Error("Failed to connect to database");
  }
}

/**
 * Gracefully close database connection
 */
export async function closeDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log("✅ Database connection closed");
  } catch (error) {
    console.error("❌ Error closing database:", error);
    throw error;
  }
}

/**
 * Health check for database
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error("Database health check failed:", error);
    return false;
  }
}
