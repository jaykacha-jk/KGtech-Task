import { JobStatus } from '../enums/jobStatus.enum';

export interface IJobDocument {
  jobId: string;
  filename: string;
  size: number;
  status: JobStatus;
  attempts: number;
  createdAt: Date;
  completedAt?: Date | null;
  failureReason?: string | null;
  processingDuration?: number | null;
}

export interface CreateJobInput {
  filename: string;
  size: number;
}

export interface UpdateJobStatusInput {
  status: JobStatus;
  attempts?: number;
  completedAt?: Date | null;
  failureReason?: string | null;
  processingDuration?: number | null;
}

export interface IJobRepository {
  create(input: CreateJobInput & { jobId: string }): Promise<IJobDocument>;
  findByJobId(jobId: string): Promise<IJobDocument | null>;
  updateStatus(jobId: string, input: UpdateJobStatusInput): Promise<IJobDocument | null>;
  countByStatus(status: JobStatus): Promise<number>;
}

export interface IQueueService {
  enqueueJob(payload: { jobId: string; filename: string; size: number }): Promise<void>;
  getJobCounts(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  }>;
}
