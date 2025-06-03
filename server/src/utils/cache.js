import { createClient } from 'redis';
import logger from './logger.js';

const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

client.on('error', (err) => logger.error(`Redis Client Error: ${err}`));

const connectCache = async () => {
  await client.connect();
  logger.info('Connected to Redis');
};

const getCachedData = async (key) => {
  try {
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error(`Redis get error: ${error.message}`);
    return null;
  }
};

const setCachedData = async (key, value, expiry = 3600) => {
  try {
    await client.setEx(key, expiry, JSON.stringify(value));
    logger.info(`Cached data for key: ${key}`);
  } catch (error) {
    logger.error(`Redis set error: ${error.message}`);
  }
};

export { connectCache, getCachedData, setCachedData };