import { randomUUID } from 'crypto';
import { jobRepository } from '../repositories/job.repository';
import { queueService } from '../queues/queue.service';
import { NotFoundError } from '../exceptions/app.errors';
import { MESSAGES } from '../messages/en';
import { CreateJobDto, JobResponseDto } from '../types/api.types';
import { logger } from '../config/logger';
import { JobStatus } from '../enums/jobStatus.enum';

export class JobService {
  async createJob(input: CreateJobDto): Promise<JobResponseDto> {
    const jobId = randomUUID();

    await jobRepository.create({
      jobId,
      filename: input.filename,
      size: input.size,
    });

    logger.info({ jobId, filename: input.filename, size: input.size }, MESSAGES.JOB.JOB_CREATED);

    await queueService.enqueueJob({
      jobId,
      filename: input.filename,
      size: input.size,
    });

    return { jobId, status: JobStatus.QUEUED };
  }

  async getJobById(jobId: string): Promise<JobResponseDto> {
    const job = await jobRepository.findByJobId(jobId);

    if (!job) {
      throw new NotFoundError(MESSAGES.JOB.JOB_NOT_FOUND);
    }

    return {
      jobId: job.jobId,
      status: job.status,
      createdAt: job.createdAt.toISOString(),
      completedAt: job.completedAt ? job.completedAt.toISOString() : null,
      attempts: job.attempts,
    };
  }
}

export const jobService = new JobService();
