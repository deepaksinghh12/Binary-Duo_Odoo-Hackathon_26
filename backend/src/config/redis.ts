import { createClient, RedisClientType } from 'redis';
import { env } from './env';

let redisClient: RedisClientType | null = null;

export const getRedisClient = async (): Promise<RedisClientType> => {
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  redisClient = createClient({
    url: env.REDIS_URL || 'redis://localhost:6379',
  });

  redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });

  redisClient.on('connect', () => {
    console.log('✓ Redis connected successfully');
  });

  await redisClient.connect();
  return redisClient;
};

export const closeRedisClient = async (): Promise<void> => {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    redisClient = null;
  }
};

// Helper functions for common caching operations
export const cacheGet = async (key: string): Promise<string | null> => {
  const client = await getRedisClient();
  return client.get(key);
};

export const cacheSet = async (
  key: string,
  value: string,
  expirySeconds?: number
): Promise<void> => {
  const client = await getRedisClient();
  if (expirySeconds) {
    await client.setEx(key, expirySeconds, value);
  } else {
    await client.set(key, value);
  }
};

export const cacheDel = async (key: string): Promise<void> => {
  const client = await getRedisClient();
  await client.del(key);
};

export const cacheDelPattern = async (pattern: string): Promise<void> => {
  const client = await getRedisClient();
  const keys = await client.keys(pattern);
  if (keys.length > 0) {
    await client.del(keys);
  }
};
