import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { JobRepository } from '../../src/repositories/job.repository';
import { JobStatus } from '../../src/enums/jobStatus.enum';

describe('JobRepository', () => {
  let mongoServer: MongoMemoryServer;
  let repository: JobRepository;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    repository = new JobRepository();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await mongoose.connection.db?.dropDatabase();
  });

  it('creates and retrieves a job', async () => {
    const created = await repository.create({
      jobId: 'job-1',
      filename: 'test.csv',
      size: 512,
    });

    expect(created.status).toBe(JobStatus.QUEUED);
    expect(created.attempts).toBe(0);

    const found = await repository.findByJobId('job-1');
    expect(found?.filename).toBe('test.csv');
  });

  it('updates job status', async () => {
    await repository.create({ jobId: 'job-2', filename: 'a.csv', size: 100 });

    const updated = await repository.updateStatus('job-2', {
      status: JobStatus.COMPLETED,
      attempts: 1,
      completedAt: new Date(),
      processingDuration: 5000,
    });

    expect(updated?.status).toBe(JobStatus.COMPLETED);
    expect(updated?.attempts).toBe(1);
  });
});
