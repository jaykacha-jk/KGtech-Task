import { pingRedis } from '../config/redis';
import { getMongoConnectionState } from '../config/mongoose';
import { HealthDto } from '../types/api.types';

const startTime = Date.now();

export class HealthService {
  async getHealth(): Promise<HealthDto> {
    const redisConnected = await pingRedis();
    const dbState = getMongoConnectionState();

    return {
      status: redisConnected && dbState === 'connected' ? 'UP' : 'DEGRADED',
      redis: redisConnected ? 'connected' : 'disconnected',
      database: dbState,
      uptime: `${Math.floor((Date.now() - startTime) / 1000)}s`,
      timestamp: new Date().toISOString(),
    };
  }
}

export const healthService = new HealthService();
