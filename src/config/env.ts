import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  REDIS_HOST: z.string().min(1).default('127.0.0.1'),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.coerce.number().int().min(0).default(0),
  BULLMQ_PREFIX: z.string().default('bull'),
  QUEUE_NAME: z.string().default('file-processing'),
  WORKER_CONCURRENCY: z.coerce.number().int().positive().default(5),
  JOB_MAX_ATTEMPTS: z.coerce.number().int().positive().default(3),
  JOB_BACKOFF_DELAY_MS: z.coerce.number().int().positive().default(1000),
  JOB_FAILURE_RATE: z.coerce.number().min(0).max(1).default(0.2),
  JOB_MIN_PROCESSING_MS: z.coerce.number().int().positive().default(5000),
  JOB_MAX_PROCESSING_MS: z.coerce.number().int().positive().default(10000),
  MAX_FILE_SIZE_BYTES: z.coerce.number().int().positive().default(104857600),
  JWT_SECRET: z.string().min(16).default('dev-jwt-secret-change-me'),
  JWT_EXPIRES_IN: z.string().default('24h'),
  AUTH_ENABLED: z
    .string()
    .default('false')
    .transform((v) => v === 'true'),
  AUTH_USERNAME: z.string().default('admin'),
  AUTH_PASSWORD: z.string().default('admin123'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  CORS_ORIGIN: z.string().default('*'),
  AWS_REGION: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  AWS_S3_UPLOAD_PREFIX: z.string().default('uploads'),
  AWS_S3_PRESIGNED_URL_EXPIRES_IN: z.coerce.number().int().positive().default(3600),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

export type Env = z.infer<typeof envSchema>;

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const formatted = parsed.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  console.error(`Environment validation failed:\n${formatted}`);
  process.exit(1);
}

export const env: Env = parsed.data;
