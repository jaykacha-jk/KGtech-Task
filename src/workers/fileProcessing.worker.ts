import { Job } from 'bullmq';
import {
  createFileProcessingWorker,
  FileProcessingJobPayload,
  getQueueEvents,
} from '../config/bullmq';
import { logger } from '../config/logger';
import { MESSAGES } from '../messages/en';
import { fileProcessingJobHandler } from '../jobs/fileProcessing.job';
import { connectMongoDB, disconnectMongoDB } from '../config/mongoose';

let worker: ReturnType<typeof createFileProcessingWorker> | null = null;

const registerQueueEvents = (): void => {
  const queueEvents = getQueueEvents();

  queueEvents.on('drained', () => {
    logger.info(MESSAGES.JOB.QUEUE_DRAINED);
  });

  queueEvents.on('stalled', ({ jobId }) => {
    logger.warn({ jobId }, MESSAGES.JOB.QUEUE_STALLED);
  });
};

export const startWorker = async (): Promise<void> => {
  await connectMongoDB();

  worker = createFileProcessingWorker(async (job: Job<FileProcessingJobPayload>) => {
    await fileProcessingJobHandler.processJob(job);
  });

  registerQueueEvents();

  worker.on('failed', (job, error) => {
    if (job) {
      logger.error(
        { jobId: job.data.jobId, attempt: job.attemptsMade, err: error.message },
        MESSAGES.JOB.JOB_FAILED,
      );
    }
  });

  worker.on('error', (error) => {
    logger.error({ err: error }, 'Worker error');
  });

  logger.info(MESSAGES.JOB.WORKER_STARTED);
};

export const stopWorker = async (): Promise<void> => {
  if (worker) {
    await worker.close();
    worker = null;
    logger.info(MESSAGES.JOB.WORKER_STOPPED);
  }

  await disconnectMongoDB();
};
