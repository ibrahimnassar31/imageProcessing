import supertest from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { v2 as cloudinary } from 'cloudinary';
import logger from '../src/utils/logger.js';

// Mock Cloudinary
jest.mock('cloudinary', () => ({
  v2: {
    uploader: {
      upload_stream: jest.fn((options, callback) => {
        callback(null, {
          public_id: 'test_image_id',
          secure_url: 'https://res.cloudinary.com/test_image.jpg',
          width: 100,
          height: 100,
        });
      }),
      destroy: jest.fn((public_id, callback) => {
        callback(null, { result: 'ok' });
      }),
    },
    url: jest.fn(() => 'https://res.cloudinary.com/test_image_transformed.jpg'),
  },
}));

describe('Images API', () => {
  let request;
  let token;

  beforeAll(async () => {
    request = supertest(app);
    const response = await request.post('/api/auth/register').send({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    });
    token = response.body.data.token;
    logger.info('Test user registered for Images API tests');
  });

  afterEach(async () => {
    await mongoose.connection.collection('images').deleteMany({});
    logger.info('Images collection cleared after test');
  });

  afterAll(async () => {
    await mongoose.connection.collection('users').deleteMany({});
    logger.info('Users collection cleared after all tests');
  });

  it('should upload an image', async () => {
    const response = await request
      .post('/api/images')
      .set('Authorization', `Bearer ${token}`)
      .attach('image', Buffer.from('test'), 'test.jpg');

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('url', 'https://res.cloudinary.com/test_image.jpg');
    expect(response.body.data.metadata).toHaveProperty('originalName', 'test.jpg');
  });

  it('should get an image', async () => {
    const uploadResponse = await request
      .post('/api/images')
      .set('Authorization', `Bearer ${token}`)
      .attach('image', Buffer.from('test'), 'test.jpg');

    const imageId = uploadResponse.body.data.id;

    const response = await request
      .get(`/api/images/${imageId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('url', 'https://res.cloudinary.com/test_image.jpg');
  });

  it('should list images', async () => {
    await request
      .post('/api/images')
      .set('Authorization', `Bearer ${token}`)
      .attach('image', Buffer.from('test'), 'test.jpg');

    const response = await request
      .get('/api/images?page=1&limit=10')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.pagination).toHaveProperty('total', 1);
  });

  it('should transform an image', async () => {
    const uploadResponse = await request
      .post('/api/images')
      .set('Authorization', `Bearer ${token}`)
      .attach('image', Buffer.from('test'), 'test.jpg');

    const imageId = uploadResponse.body.data.id;

    const response = await request
      .post(`/api/images/${imageId}/transform`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        transformations: {
          resize: { width: 200, height: 200 },
          filters: { grayscale: true },
        },
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('transformedUrl', 'https://res.cloudinary.com/test_image_transformed.jpg');
  });

  it('should delete an image', async () => {
    const uploadResponse = await request
      .post('/api/images')
      .set('Authorization', `Bearer ${token}`)
      .attach('image', Buffer.from('test'), 'test.jpg');

    const imageId = uploadResponse.body.data.id;

    const response = await request
      .delete(`/api/images/${imageId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Image deleted successfully');

    const getResponse = await request
      .get(`/api/images/${imageId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(getResponse.status).toBe(404);
    expect(getResponse.body.success).toBe(false);
  });

  it('should update image metadata', async () => {
    const uploadResponse = await request
      .post('/api/images')
      .set('Authorization', `Bearer ${token}`)
      .attach('image', Buffer.from('test'), 'test.jpg');

    const imageId = uploadResponse.body.data.id;

    const response = await request
      .patch(`/api/images/${imageId}/metadata`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        metadata: {
          originalName: 'updated_test.jpg',
          description: 'Updated description',
        },
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.metadata).toHaveProperty('originalName', 'updated_test.jpg');
    expect(response.body.data.metadata).toHaveProperty('description', 'Updated description');
  });
});