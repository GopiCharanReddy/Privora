import { Worker } from 'bullmq';
import { createRedisConnection } from '../redis.ts';
import { db } from '../../db/setup.ts';
import { messages } from '../../db/schema.ts';

const chatWorker = new Worker(
  'chatQueue',
  async job => {
    const { userId, roomId, senderName, message } = job.data;

    // roomId is the slug
    let resolvedRoomId: number | undefined;

    if (typeof roomId === 'string') {
      const room = await db.query.rooms.findFirst({
        where: (rooms, { eq }) => eq(rooms.slug, roomId),
      });
      resolvedRoomId = room?.id;
    } else {
      resolvedRoomId = roomId;
    }

    if (!resolvedRoomId) {
      console.error(`Job ${job.id}: room not found for slug ${roomId}`);
      return;
    }

    await db.insert(messages).values({
      message,
      senderName: senderName ?? "Anonymous",
      roomId: resolvedRoomId,
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
});