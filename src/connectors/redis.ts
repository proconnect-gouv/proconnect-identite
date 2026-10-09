import { createClient, type RedisClientType } from "redis";
import { REDIS_URL } from "../config/env";
import { logger } from "../services/log";

const redisClients: { [key: string]: RedisClientType } = {};

export const getNewRedisClient = (
  options: { disableOfflineQueue?: boolean } = {},
) => {
  const clientKey = JSON.stringify(options);
  if (!redisClients[clientKey]) {
    const redisClient: RedisClientType = createClient({
      ...options,
      url: REDIS_URL,
    });
    redisClient.on("connect", () =>
      logger.debug(
        `Connected to database : ${REDIS_URL} with options: ${clientKey}`,
      ),
    );
    redisClient.on("error", (error) => logger.error(error));
    redisClient.connect().catch((error) => logger.error(error));
    redisClients[clientKey] = redisClient;
  }

  return redisClients[clientKey];
};
