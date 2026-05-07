import dotenv from "dotenv";
dotenv.config();

const required = (key: string): string => {
  const val = process.env[key];
  if (!val) throw new Error(`Missing env variable: ${key}`);
  return val;
};

export const config = {
  port: Number(process.env.PORT) || 3000,
  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "15m",
  refreshSecret: required("REFRESH_TOKEN_SECRET"),
  refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN ?? "7d",
  databaseUrl: required("DATABASE_URL"),
} as const;
