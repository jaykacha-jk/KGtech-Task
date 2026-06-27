import { Job } from 'bullmq';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { jobRepository } from '../repositories/job.repository';
import { JobStatus } from '../enums/jobStatus.enum';
import { MESSAGES } from '../messages/en';
import { FileProcessingJobPayload } from '../config/bullmq';
import { randomInt, shouldSimulateFailure, sleep } from '../utils/common.utils';

export class SimulatedProcessingError extends Error {
  constructor(message = 'Simulated processing failure') {
    super(message);
    this.name = 'SimulatedProcessingError';
  }
}

export class FileProcessingJobHandler {
  async processJob(job: Job<FileProcessingJobPayload>): Promise<void> {
    const { jobId, filename } = job.data;
    const attempt = job.attemptsMade + 1;

    this.logProcessing('started', { jobId, filename, attempt });

    await this.updateJobStatus(jobId, {
      status: JobStatus.ACTIVE,
      attempts: attempt,
    });

    const durationMs = await this.simulateProcessing(jobId, filename);

    if (shouldSimulateFailure(env.JOB_FAILURE_RATE)) {
      await this.handleFailure(jobId, attempt, 'Simulated random processing failure');
      throw new SimulatedProcessingError();
    }

    await this.updateJobStatus(jobId, {
      status: JobStatus.COMPLETED,
      attempts: attempt,
      completedAt: new Date(),
      processingDuration: durationMs,
      failureReason: null,
    });

    this.logProcessing('completed', { jobId, filename, attempt, durationMs });
  }

  private async simulateProcessing(jobId: string, filename: string): Promise<number> {
    const durationMs = randomInt(env.JOB_MIN_PROCESSING_MS, env.JOB_MAX_PROCESSING_MS);

    logger.info(
      { jobId, filename, durationMs },
      MESSAGES.JOB.JOB_PROGRESS,
    );

    await sleep(durationMs);
    return durationMs;
  }

  private async updateJobStatus(
    jobId: string,
    input: {
      status: JobStatus;
      attempts: number;
      completedAt?: Date | null;
      processingDuration?: number | null;
      failureReason?: string | null;
    },
  ): Promise<void> {
    await jobRepository.updateStatus(jobId, input);
  }

  private async handleFailure(
    jobId: string,
    attempt: number,
    reason: string,
  ): Promise<void> {
    const isFinalAttempt = attempt >= env.JOB_MAX_ATTEMPTS;

    if (isFinalAttempt) {
      await this.updateJobStatus(jobId, {
        status: JobStatus.FAILED,
        attempts: attempt,
        failureReason: reason,
      });
      logger.error({ jobId, attempt, reason }, MESSAGES.JOB.JOB_FAILED);
    } else {
      await this.updateJobStatus(jobId, {
        status: JobStatus.QUEUED,
        attempts: attempt,
        failureReason: reason,
      });
      logger.warn({ jobId, attempt, reason }, MESSAGES.JOB.RETRY_ATTEMPT);
    }
  }

  private logProcessing(
    event: 'started' | 'completed',
    context: Record<string, unknown>,
  ): void {
    const message =
      event === 'started' ? MESSAGES.JOB.JOB_STARTED : MESSAGES.JOB.JOB_COMPLETED;
    logger.info(context, message);
  }
}

export const fileProcessingJobHandler = new FileProcessingJobHandler();
