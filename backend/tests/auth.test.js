require('dotenv').config();
const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/lib/prisma');

const email = `test_${Date.now()}@example.com`;
const password = 'testpass123';
let token;

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email } });
  await prisma.$disconnect();
});

describe('POST /api/auth/register', () => {
  it('creates a user and returns token', async () => {
    const res = await request(app).post('/api/auth/register').send({
      full_name: 'Test User',
      email,
      password,
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe(email);
    expect(res.body.user).not.toHaveProperty('passwordHash');
    token = res.body.token;
  });

  it('rejects duplicate email with 409', async () => {
    const res = await request(app).post('/api/auth/register').send({
      full_name: 'Another',
      email,
      password,
    });
    expect(res.status).toBe(409);
  });

  it('rejects missing fields with 400', async () => {
    const res = await request(app).post('/api/auth/register').send({ email });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('logs in with correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({ email, password });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('rejects wrong password with 401', async () => {
    const res = await request(app).post('/api/auth/login').send({ email, password: 'wrong' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  it('returns authenticated user', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe(email);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
