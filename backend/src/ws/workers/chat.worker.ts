import { Worker } from 'bullmq';
import { createRedisConnection } from '../redis.ts';
import { db } from '../../db/setup.ts';
import { messages } from '../../db/schema.ts';

const chatWorker = new Worker(
  'chatQueue',
  async job => {
    const { userId, roomId, message } = job.data;

    await db.insert(messages).values({
      message,
      roomId,
      userId,
    });
    console.log(`Job ${job.id} saved message to DB`);
  },
  {
    connection: createRedisConnection()
  },
);

chatWorker.on('completed', job => {
  console.log(`${job.id} has completed.`);
});

chatWorker.on('failed', (job, err) => {
  console.log(`${job?.id} has failed with ${err.message}`);
})