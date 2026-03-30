import { Queue } from 'bullmq';
import { createRedisConnection } from '../redis.ts';

export const chatQueue = new Queue('chatQueue', {
  connection: createRedisConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    }
  }
});
