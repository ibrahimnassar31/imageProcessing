import supertest from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import logger from '../src/utils/logger.js';

describe('Auth API', () => {
  let request;

  beforeAll(() => {
    request = supertest(app);
    logger.info('Starting Auth API tests');
  });

  afterEach(async () => {
    await mongoose.connection.collection('users').deleteMany({});
    logger.info('Users collection cleared after test');
  });

  afterAll(async () => {
    logger.info('Finished Auth API tests');
  });

  it('should register a new user', async () => {
    const response = await request.post('/api/auth/register').send({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('username', 'testuser');
    expect(response.body.data).toHaveProperty('email', 'test@example.com');
    expect(response.body.data).toHaveProperty('token');
  });

  it('should fail to register with existing email', async () => {
    await request.post('/api/auth/register').send({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    });

    const response = await request.post('/api/auth/register').send({
      username: 'testuser2',
      email: 'test@example.com',
      password: 'password123',
    });

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Username or email already exists');
  });

  it('should login with correct credentials', async () => {
    await request.post('/api/auth/register').send({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    });

    const response = await request.post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('username', 'testuser');
    expect(response.body.data).toHaveProperty('token');
    expect(response.headers['set-cookie']).toBeDefined();
  });

  it('should fail to login with incorrect credentials', async () => {
    const response = await request.post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'wrongpassword',
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Invalid credentials');
  });

  it('should logout successfully', async () => {
    const response = await request.post('/api/auth/logout');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Logged out successfully');
    expect(response.headers['set-cookie']).toContainEqual(
      expect.stringContaining('token=;')
    );
  });
});