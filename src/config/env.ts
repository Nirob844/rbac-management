import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  HOST: z.string().default("0.0.0.0"),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  JWT_EXPIRES_IN: z.string().default("15m"),
  REFRESH_TOKEN_SECRET: z.string().min(1, "REFRESH_TOKEN_SECRET is required"),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default("7d"),
  DEFAULT_ADMIN_EMAIL: z.string().email().default("admin@rbac.local"),
  DEFAULT_ADMIN_USERNAME: z.string().min(3).max(20).default("admin"),
  DEFAULT_ADMIN_PASSWORD: z.string().min(8).default("Admin@12345"),
});

const env = envSchema.parse(process.env);

export const config = {
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  host: env.HOST,
  logLevel: env.LOG_LEVEL,
  databaseUrl: env.DATABASE_URL,
  jwtSecret: env.JWT_SECRET,
  jwtExpiresIn: env.JWT_EXPIRES_IN,
  refreshSecret: env.REFRESH_TOKEN_SECRET,
  refreshExpiresIn: env.REFRESH_TOKEN_EXPIRES_IN,
  defaultAdminEmail: env.DEFAULT_ADMIN_EMAIL,
  defaultAdminUsername: env.DEFAULT_ADMIN_USERNAME,
  defaultAdminPassword: env.DEFAULT_ADMIN_PASSWORD,
} as const;
