const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');

let mongoServer;
let token;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await mongoose.connection.dropDatabase();
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Marcus', email: 'marcus@test.com', password: 'password123' });
  token = res.body.token;
});

const txPayload = {
  amount: -45.50,
  type: 'expense',
  category: 'Groceries',
  merchant: 'Walmart',
  date: '2026-04-01',
};

describe('POST /api/transactions', () => {
  it('creates a transaction', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send(txPayload);
    expect(res.status).toBe(201);
    expect(res.body.merchant).toBe('Walmart');
  });

  it('returns 401 without token', async () => {
    const res = await request(app).post('/api/transactions').send(txPayload);
    expect(res.status).toBe(401);
  });
});

describe('GET /api/transactions', () => {
  beforeEach(async () => {
    await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send(txPayload);
  });

  it('returns list of transactions', async () => {
    const res = await request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].merchant).toBe('Walmart');
  });

  it('filters by category', async () => {
    await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...txPayload, category: 'Dining', merchant: 'McDonalds' });
    const res = await request(app)
      .get('/api/transactions?category=Dining')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].category).toBe('Dining');
  });
});

describe('DELETE /api/transactions/:id', () => {
  it('deletes a transaction', async () => {
    const create = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send(txPayload);
    const del = await request(app)
      .delete(`/api/transactions/${create.body._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect([200, 204]).toContain(del.status);
  });

  it('returns 404 for non-existent transaction', async () => {
    const res = await request(app)
      .delete(`/api/transactions/${new mongoose.Types.ObjectId()}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});
