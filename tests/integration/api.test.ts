jest.mock('../../src/config/bullmq', () => {
  const mockQueue = {
    add: jest.fn().mockResolvedValue({ id: 'mock-job-id' }),
    getJobCounts: jest
      .fn()
      .mockResolvedValue({ waiting: 1, active: 0, completed: 2, failed: 0 }),
    close: jest.fn().mockResolvedValue(undefined),
  };

  return {
    getFileProcessingQueue: jest.fn(() => mockQueue),
    getBullMQConnection: jest.fn(() => ({})),
    getQueueEvents: jest.fn(() => ({ on: jest.fn(), close: jest.fn() })),
    closeBullMQResources: jest.fn().mockResolvedValue(undefined),
    createFileProcessingWorker: jest.fn(),
  };
});

jest.mock('../../src/config/redis', () => ({
  getRedisClient: jest.fn(),
  pingRedis: jest.fn().mockResolvedValue(true),
  closeRedisConnection: jest.fn().mockResolvedValue(undefined),
  createRedisConnection: jest.fn(),
}));

import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { createApp } from '../../src/app';
import { connectMongoDB, disconnectMongoDB } from '../../src/config/mongoose';

describe('API Integration', () => {
  let mongoServer: MongoMemoryServer;
  const app = createApp();

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await connectMongoDB(mongoServer.getUri());
  });

  afterAll(async () => {
    await disconnectMongoDB();
    await mongoServer.stop();
  });

  it('GET /health returns service status', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('status');
    expect(response.body.data).toHaveProperty('database');
    expect(response.body.meta).toHaveProperty('requestId');
  });

  it('POST /jobs creates a job', async () => {
    const response = await request(app)
      .post('/jobs')
      .send({ filename: 'orders.csv', size: 1024 });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toMatchObject({ status: 'queued' });
    expect(response.body.data.jobId).toBeDefined();
  });

  it('POST /jobs rejects invalid payload', async () => {
    const response = await request(app).post('/jobs').send({ filename: '', size: -1 });

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
    expect(response.body.errors.length).toBeGreaterThan(0);
  });

  it('GET /jobs/:id returns 404 for unknown job', async () => {
    const response = await request(app).get('/jobs/unknown-id-12345');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it('GET /stats returns queue counts', async () => {
    const response = await request(app).get('/stats');

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      waiting: expect.any(Number),
      active: expect.any(Number),
      completed: expect.any(Number),
      failed: expect.any(Number),
    });
  });
});
