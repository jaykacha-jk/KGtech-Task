import { JobModel } from '../models/job.model';
import {
  CreateJobInput,
  IJobDocument,
  IJobRepository,
  UpdateJobStatusInput,
} from '../interfaces/job.interface';
import { JobStatus } from '../enums/jobStatus.enum';

const toJobDocument = (doc: InstanceType<typeof JobModel>): IJobDocument => ({
  jobId: doc.jobId,
  filename: doc.filename,
  size: doc.size,
  status: doc.status,
  attempts: doc.attempts,
  createdAt: doc.createdAt,
  completedAt: doc.completedAt ?? null,
  failureReason: doc.failureReason ?? null,
  processingDuration: doc.processingDuration ?? null,
});

export class JobRepository implements IJobRepository {
  async create(input: CreateJobInput & { jobId: string }): Promise<IJobDocument> {
    const job = await JobModel.create({
      jobId: input.jobId,
      filename: input.filename,
      size: input.size,
      status: JobStatus.QUEUED,
      attempts: 0,
    });

    return toJobDocument(job);
  }

  async findByJobId(jobId: string): Promise<IJobDocument | null> {
    const job = await JobModel.findOne({ jobId }).exec();
    return job ? toJobDocument(job) : null;
  }

  async updateStatus(jobId: string, input: UpdateJobStatusInput): Promise<IJobDocument | null> {
    const job = await JobModel.findOneAndUpdate(
      { jobId },
      {
        status: input.status,
        ...(input.attempts !== undefined && { attempts: input.attempts }),
        ...(input.completedAt !== undefined && { completedAt: input.completedAt }),
        ...(input.failureReason !== undefined && { failureReason: input.failureReason }),
        ...(input.processingDuration !== undefined && {
          processingDuration: input.processingDuration,
        }),
      },
      { returnDocument: 'after' },
    ).exec();

    return job ? toJobDocument(job) : null;
  }

  async countByStatus(status: JobStatus): Promise<number> {
    return JobModel.countDocuments({ status }).exec();
  }
}

export const jobRepository = new JobRepository();
