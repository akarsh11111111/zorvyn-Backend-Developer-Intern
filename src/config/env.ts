import dotenv from "dotenv";

dotenv.config();

function getEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;

  if (value === undefined || value === "") {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value;
}

export const env = {
  nodeEnv: getEnv("NODE_ENV", "development"),
  port: Number(getEnv("PORT", "5000")),
  jwtSecret: getEnv("JWT_SECRET", "dev_secret"),
  jwtExpiresIn: getEnv("JWT_EXPIRES_IN", "1d"),
  jsonBodyLimit: getEnv("JSON_BODY_LIMIT", "1mb"),
  dataFile: getEnv("DATA_FILE", "src/data/store.json"),
  idempotencyTtlMs: Number(getEnv("IDEMPOTENCY_TTL_MS", "600000")),
  rateLimitWindowMs: Number(getEnv("RATE_LIMIT_WINDOW_MS", "60000")),
  rateLimitMax: Number(getEnv("RATE_LIMIT_MAX", "200")),
  defaultAdminName: getEnv("DEFAULT_ADMIN_NAME", "Akarsh Vidyarthi"),
  defaultAdminEmail: getEnv("DEFAULT_ADMIN_EMAIL", "vidyarthiakarsh@gmail.com"),
  defaultAdminPassword: getEnv("DEFAULT_ADMIN_PASSWORD", "Admin@123")
};
