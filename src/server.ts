import { createApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { connectMongoDB, disconnectMongoDB } from './config/mongoose';
import { closeRedisConnection } from './config/redis';
import { closeBullMQResources } from './config/bullmq';

const bootstrap = async (): Promise<void> => {
  await connectMongoDB();

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT, env: env.NODE_ENV }, 'API server started');
  });

  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Shutting down API server');

    server.close(async () => {
      await closeBullMQResources();
      await closeRedisConnection();
      await disconnectMongoDB();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
};

bootstrap().catch((error: Error) => {
  logger.fatal({ err: error }, 'Failed to start API server');
  process.exit(1);
});
