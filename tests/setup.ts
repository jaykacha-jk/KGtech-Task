process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'silent';
process.env.MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/kgtech_test';
process.env.REDIS_HOST = process.env.REDIS_HOST ?? '127.0.0.1';
process.env.REDIS_PORT = process.env.REDIS_PORT ?? '6379';
process.env.JWT_SECRET = 'test-jwt-secret-key-min-16';
process.env.AUTH_ENABLED = 'false';
process.env.JOB_MIN_PROCESSING_MS = '10';
process.env.JOB_MAX_PROCESSING_MS = '20';
process.env.JOB_FAILURE_RATE = '0';

const originalWarn = console.warn;
console.warn = (...args: unknown[]) => {
  const message = args.map(String).join(' ');
  if (message.includes('Using NodeJS below 20.19.0')) {
    return;
  }
  originalWarn(...args);
};
