import { FileProcessingJobHandler, SimulatedProcessingError } from '../../src/jobs/fileProcessing.job';
import { jobRepository } from '../../src/repositories/job.repository';
import { JobStatus } from '../../src/enums/jobStatus.enum';

jest.mock('../../src/config/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), child: jest.fn() },
  createChildLogger: jest.fn(),
}));

jest.mock('../../src/repositories/job.repository', () => ({
  jobRepository: {
    updateStatus: jest.fn().mockResolvedValue({}),
  },
}));

jest.mock('../../src/config/env', () => ({
  env: {
    JOB_MIN_PROCESSING_MS: 10,
    JOB_MAX_PROCESSING_MS: 20,
    JOB_FAILURE_RATE: 1,
    JOB_MAX_ATTEMPTS: 3,
    LOG_LEVEL: 'silent',
    NODE_ENV: 'test',
  },
}));

describe('FileProcessingJobHandler', () => {
  const handler = new FileProcessingJobHandler();

  const mockJob = {
    data: { jobId: 'job-1', filename: 'test.csv', size: 100 },
    attemptsMade: 0,
  } as import('bullmq').Job;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws SimulatedProcessingError on simulated failure', async () => {
    await expect(handler.processJob(mockJob)).rejects.toThrow(SimulatedProcessingError);
    expect(jobRepository.updateStatus).toHaveBeenCalledWith(
      'job-1',
      expect.objectContaining({ status: JobStatus.ACTIVE }),
    );
  });
});
