import mongoose, { Document, Schema } from 'mongoose';
import { JobStatus } from '../enums/jobStatus.enum';

export interface IJob extends Document {
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

const jobSchema = new Schema<IJob>(
  {
    jobId: { type: String, required: true, unique: true, index: true },
    filename: { type: String, required: true },
    size: { type: Number, required: true },
    status: {
      type: String,
      enum: Object.values(JobStatus),
      default: JobStatus.QUEUED,
      index: true,
    },
    attempts: { type: Number, default: 0 },
    completedAt: { type: Date, default: null },
    failureReason: { type: String, default: null },
    processingDuration: { type: Number, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: true } },
);

export const JobModel = mongoose.model<IJob>('Job', jobSchema);
