import Redis from 'ioredis';
import { env } from './env';
import { logger } from './logger';

let redisClient: Redis | null = null;

export const createRedisConnection = (): Redis => {
  const connection = new Redis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD || undefined,
    db: env.REDIS_DB,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: false,
    retryStrategy: (times: number) => Math.min(times * 200, 2000),
  });

  connection.on('error', (error: Error) => {
    logger.error({ err: error }, 'Redis connection error');
  });

  connection.on('connect', () => {
    logger.info('Redis connected successfully');
  });

  return connection;
};

export const getRedisClient = (): Redis => {
  if (!redisClient) {
    redisClient = createRedisConnection();
  }

  return redisClient;
};

export const closeRedisConnection = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis disconnected');
  }
};

export const pingRedis = async (): Promise<boolean> => {
  try {
    const client = getRedisClient();
    const result = await client.ping();
    return result === 'PONG';
  } catch {
    return false;
  }
};
