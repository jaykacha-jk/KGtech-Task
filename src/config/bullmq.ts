import { Queue, Worker, QueueEvents, JobsOptions, ConnectionOptions } from 'bullmq';
import { env } from './env';
import { QUEUE_NAMES } from '../constants/queue.constants';

export interface FileProcessingJobPayload {
  jobId: string;
  filename: string;
  size: number;
}

const defaultJobOptions: JobsOptions = {
  attempts: env.JOB_MAX_ATTEMPTS,
  backoff: {
    type: 'exponential',
    delay: env.JOB_BACKOFF_DELAY_MS,
  },
  removeOnComplete: {
    count: 1000,
  },
  removeOnFail: {
    count: 5000,
  },
};

let fileProcessingQueue: Queue<FileProcessingJobPayload> | null = null;
let queueEvents: QueueEvents | null = null;

export const getBullMQConnection = (): ConnectionOptions => ({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  db: env.REDIS_DB,
  maxRetriesPerRequest: null,
});

export const getFileProcessingQueue = (): Queue<FileProcessingJobPayload> => {
  if (!fileProcessingQueue) {
    fileProcessingQueue = new Queue<FileProcessingJobPayload>(QUEUE_NAMES.FILE_PROCESSING, {
      connection: getBullMQConnection(),
      prefix: env.BULLMQ_PREFIX,
      defaultJobOptions,
    });
  }

  return fileProcessingQueue;
};

export const getQueueEvents = (): QueueEvents => {
  if (!queueEvents) {
    queueEvents = new QueueEvents(QUEUE_NAMES.FILE_PROCESSING, {
      connection: getBullMQConnection(),
      prefix: env.BULLMQ_PREFIX,
    });
  }

  return queueEvents;
};

export const createFileProcessingWorker = (
  processor: (job: import('bullmq').Job<FileProcessingJobPayload>) => Promise<void>,
): Worker<FileProcessingJobPayload> => {
  return new Worker<FileProcessingJobPayload>(QUEUE_NAMES.FILE_PROCESSING, processor, {
    connection: getBullMQConnection(),
    prefix: env.BULLMQ_PREFIX,
    concurrency: env.WORKER_CONCURRENCY,
  });
};

export const closeBullMQResources = async (): Promise<void> => {
  if (queueEvents) {
    await queueEvents.close();
    queueEvents = null;
  }

  if (fileProcessingQueue) {
    await fileProcessingQueue.close();
    fileProcessingQueue = null;
  }
};

export const getDefaultJobOptions = (): JobsOptions => defaultJobOptions;
