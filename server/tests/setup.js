import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import logger from '../src/utils/logger.js';

// زيادة مهلة Jest لتجنب مشاكل الاتصال
jest.setTimeout(30000);

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  logger.info(`MongoDB Memory Server started at ${uri}`);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  logger.info('MongoDB Memory Server stopped');
});