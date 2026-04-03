import { Redis } from "ioredis"
import "dotenv/config"

const redisURL = process.env.REDIS_URL!
const password = process.env.REDIS_PASSWORD || ""

let clientInstance: Redis
let publisherInstance: Redis
let subscriberInstance: Redis

const createRedisClient = (name: string) => {
  const instance = new Redis(redisURL, {
    password,
    maxRetriesPerRequest: null,
  })

  instance.on("connect", () => {
    console.log(`Redis ${name} connected successfully.`)
  })

  instance.on("error", (error) => {
    console.error(`Redis ${name}connection Error: ${error}`)
  })

  return instance
}

export const createRedisConnection = () => {
  if (!clientInstance) {
    clientInstance = createRedisClient("client")
  }
  return clientInstance
}

export const createPublisher = () => {
  if (!publisherInstance) {
    publisherInstance = createRedisClient("publisher")
  }
  return publisherInstance
}

export const createSubscriber = () => {
  if (!subscriberInstance) {
    subscriberInstance = createRedisClient("subscriber")
  }
  return subscriberInstance
}
