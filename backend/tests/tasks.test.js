require('dotenv').config();
const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/lib/prisma');

const emailA = `task_a_${Date.now()}@example.com`;
const emailB = `task_b_${Date.now()}@example.com`;
const password = 'testpass123';
let tokenA, tokenB, projectId, taskId;

beforeAll(async () => {
  const [a, b] = await Promise.all([
    request(app).post('/api/auth/register').send({ full_name: 'Task User A', email: emailA, password }),
    request(app).post('/api/auth/register').send({ full_name: 'Task User B', email: emailB, password }),
  ]);
  tokenA = a.body.token;
  tokenB = b.body.token;

  // Create a project owned by A
  const proj = await request(app)
    .post('/api/projects')
    .set('Authorization', `Bearer ${tokenA}`)
    .send({ name: 'Task Test Project', status: 'IN_PROGRESS' });
  projectId = proj.body.project.id;
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { in: [emailA, emailB] } } });
  await prisma.$disconnect();
});

describe('POST /api/tasks', () => {
  it('creates a task in user A\'s project', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ name: 'Alpha Task', project_id: projectId, status: 'PENDING', priority: 'MEDIUM' });
    expect(res.status).toBe(201);
    expect(res.body.task).toHaveProperty('id');
    taskId = res.body.task.id;
  });

  it('user B cannot create a task in user A\'s project', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ name: 'Injected', project_id: projectId, status: 'PENDING', priority: 'LOW' });
    expect(res.status).toBe(404);
  });

  it('rejects missing name with 400', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ project_id: projectId, status: 'PENDING', priority: 'LOW' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/tasks', () => {
  it('returns tasks for user A', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${tokenA}`)
      .query({ projectId });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.tasks)).toBe(true);
    expect(res.body.tasks.length).toBeGreaterThan(0);
  });

  it('user B sees 0 tasks for user A\'s project', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${tokenB}`)
      .query({ projectId });
    expect(res.status).toBe(200);
    expect(res.body.tasks.length).toBe(0);
  });
});

describe('GET /api/tasks/:id', () => {
  it('returns the task for its owner', async () => {
    const res = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${tokenA}`);
    expect(res.status).toBe(200);
    expect(res.body.task.id).toBe(taskId);
  });

  it('user B cannot access user A\'s task', async () => {
    const res = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${tokenB}`);
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/tasks/:id', () => {
  it('updates the task', async () => {
    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ status: 'IN_PROGRESS' });
    expect(res.status).toBe(200);
    expect(res.body.task.status).toBe('IN_PROGRESS');
  });

  it('user B cannot update user A\'s task', async () => {
    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ status: 'COMPLETED' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/tasks/:id', () => {
  it('user B cannot delete user A\'s task', async () => {
    const res = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${tokenB}`);
    expect(res.status).toBe(404);
  });

  it('deletes the task', async () => {
    const res = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${tokenA}`);
    expect(res.status).toBe(200);
  });
});
