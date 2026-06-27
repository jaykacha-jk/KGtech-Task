import { getFileProcessingQueue } from '../config/bullmq';
import { IQueueService } from '../interfaces/job.interface';
import { logger } from '../config/logger';
import { MESSAGES } from '../messages/en';

export class QueueService implements IQueueService {
  async enqueueJob(payload: { jobId: string; filename: string; size: number }): Promise<void> {
    const queue = getFileProcessingQueue();

    await queue.add('process-file', payload, {
      jobId: payload.jobId,
    });

    logger.info({ jobId: payload.jobId, filename: payload.filename }, MESSAGES.JOB.JOB_QUEUED);
  }

  async getJobCounts(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  }> {
    const queue = getFileProcessingQueue();
    const counts = await queue.getJobCounts('waiting', 'active', 'completed', 'failed');

    return {
      waiting: counts.waiting ?? 0,
      active: counts.active ?? 0,
      completed: counts.completed ?? 0,
      failed: counts.failed ?? 0,
    };
  }
}

export const queueService = new QueueService();
