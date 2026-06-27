import { logger } from './config/logger';
import { startWorker, stopWorker } from './workers/fileProcessing.worker';
import { closeBullMQResources } from './config/bullmq';
import { closeRedisConnection } from './config/redis';

const bootstrap = async (): Promise<void> => {
  await startWorker();

  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Shutting down worker');
    await stopWorker();
    await closeBullMQResources();
    await closeRedisConnection();
    process.exit(0);
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
};

bootstrap().catch((error: Error) => {
  logger.fatal({ err: error }, 'Failed to start worker');
  process.exit(1);
});
