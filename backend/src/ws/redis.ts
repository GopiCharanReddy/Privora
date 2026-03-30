import { Redis } from 'ioredis';

const redisURL = process.env.REDIS_URL || 'redis://localhost:6379';

const createRedisClient = (clientName: string) => {
  const client = new Redis(redisURL, {
    maxRetriesPerRequest: null,
  });

  client.on('connect', () => {
    console.log(`Redis ${clientName} connected successfully.`);
  });

  client.on('error', (error) => {
    console.error(`Redis ${clientName} connection error: ${error}`);
  });

  return client;
}


export const createRedisConnection = () => {
  return createRedisClient('client');
}

export const createPublisher = () => {
  return createRedisClient('publisher');
};

export const createSubscriber = () => {
  return createRedisClient('subscriber');
};