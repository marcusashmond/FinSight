const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await mongoose.connection.dropDatabase();
});

describe('POST /api/auth/register', () => {
  it('registers a new user and returns a token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Marcus', email: 'marcus@test.com', password: 'password123' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('marcus@test.com');
  });

  it('returns 409 if email is already registered', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Marcus', email: 'marcus@test.com', password: 'password123' });
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Marcus', email: 'marcus@test.com', password: 'password123' });
    expect(res.status).toBe(409);
  });

  it('returns 400 if name is missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'marcus@test.com', password: 'password123' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Marcus', email: 'marcus@test.com', password: 'password123' });
  });

  it('logs in and returns a token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'marcus@test.com', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('returns 401 on wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'marcus@test.com', password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  it('returns user data with valid token', async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Marcus', email: 'marcus@test.com', password: 'password123' });
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${reg.body.token}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('marcus@test.com');
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
