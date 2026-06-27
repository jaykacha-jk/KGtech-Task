import { queueService } from '../queues/queue.service';
import { QueueStatsDto } from '../types/api.types';

export class StatsService {
  async getQueueStats(): Promise<QueueStatsDto> {
    return queueService.getJobCounts();
  }
}

export const statsService = new StatsService();
