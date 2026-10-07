require('dotenv').config();
const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/lib/prisma');

// Two independent users to verify cross-user isolation
const emailA = `proj_a_${Date.now()}@example.com`;
const emailB = `proj_b_${Date.now()}@example.com`;
const password = 'testpass123';
let tokenA, tokenB, projectId;

beforeAll(async () => {
  const [a, b] = await Promise.all([
    request(app).post('/api/auth/register').send({ full_name: 'User A', email: emailA, password }),
    request(app).post('/api/auth/register').send({ full_name: 'User B', email: emailB, password }),
  ]);
  tokenA = a.body.token;
  tokenB = b.body.token;
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { in: [emailA, emailB] } } });
  await prisma.$disconnect();
});

describe('POST /api/projects', () => {
  it('creates a project for authenticated user', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ name: 'Alpha Project', description: 'Test project', status: 'IN_PROGRESS' });
    expect(res.status).toBe(201);
    expect(res.body.project).toHaveProperty('id');
    expect(res.body.project.name).toBe('Alpha Project');
    projectId = res.body.project.id;
  });

  it('rejects unauthenticated request with 401', async () => {
    const res = await request(app).post('/api/projects').send({ name: 'X' });
    expect(res.status).toBe(401);
  });

  it('rejects missing name with 400', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ description: 'No name' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/projects', () => {
  it('returns only the requesting user\'s projects', async () => {
    const res = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${tokenA}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.projects)).toBe(true);
    res.body.projects.forEach((p) => {
      expect(p.id).not.toBeUndefined();
    });
  });

  it('user B sees 0 projects (cross-user isolation)', async () => {
    const res = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${tokenB}`);
    expect(res.status).toBe(200);
    expect(res.body.projects.length).toBe(0);
  });
});

describe('GET /api/projects/:id', () => {
  it('returns the project for its owner', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${tokenA}`);
    expect(res.status).toBe(200);
    expect(res.body.project.id).toBe(projectId);
  });

  it('returns 404 when user B tries to access user A\'s project', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${tokenB}`);
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/projects/:id', () => {
  it('updates the project', async () => {
    const res = await request(app)
      .put(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ name: 'Alpha Updated', status: 'COMPLETED' });
    expect(res.status).toBe(200);
    expect(res.body.project.name).toBe('Alpha Updated');
  });

  it('user B cannot update user A\'s project', async () => {
    const res = await request(app)
      .put(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ name: 'Hijacked' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/projects/:id', () => {
  it('user B cannot delete user A\'s project', async () => {
    const res = await request(app)
      .delete(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${tokenB}`);
    expect(res.status).toBe(404);
  });

  it('deletes the project', async () => {
    const res = await request(app)
      .delete(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${tokenA}`);
    expect(res.status).toBe(200);
  });
});
