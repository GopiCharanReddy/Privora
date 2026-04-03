import { Queue } from "bullmq"
import { createRedisConnection } from "../redis.ts"
import "dotenv/config"

export const chatQueue = new Queue("chatQueue", {
  connection: createRedisConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  },
})
