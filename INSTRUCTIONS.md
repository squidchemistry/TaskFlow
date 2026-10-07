# INSTRUCTIONS — Local Setup & Verification Guide

## Demo Credentials

| Field | Value |
|-------|-------|
| Email | `demo@example.com` |
| Password | `Demo@1234` |

These are created by the seed script in step 5 below.

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 20+ | https://nodejs.org |
| npm | 10+ | bundled with Node |
| PostgreSQL | 14+ | https://www.postgresql.org or Docker |
| Git | any | https://git-scm.com |

---

## Option A — Docker (Recommended, zero manual DB setup)

**1. Clone and start**
```bash
git clone <repo-url>
cd ISMO
docker-compose up --build
```

**2. In a separate terminal, run migrations and seed**
```bash
cd backend
npm run db:migrate       # creates tables
npm run db:seed          # creates demo@example.com / Demo@1234
```

**3. Open the app**
- Web: http://localhost:3000
- API: http://localhost:4000
- Health check: http://localhost:4000/health

---

## Option B — Manual Setup

### Step 1 — Create a PostgreSQL database

```sql
-- Run in psql
CREATE USER ismo_user WITH PASSWORD 'ismo_pass';
CREATE DATABASE ismo_db OWNER ismo_user;
```

Connection string: `postgresql://ismo_user:ismo_pass@localhost:5432/ismo_db`

### Step 2 — Configure backend environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
DATABASE_URL=postgresql://ismo_user:ismo_pass@localhost:5432/ismo_db
JWT_SECRET=replace-with-at-least-32-random-characters!!
JWT_EXPIRES_IN=7d
PORT=4000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000
```

> `JWT_SECRET` must be **at least 32 characters** — the server will refuse to start if it is shorter.

### Step 3 — Install and migrate

```bash
cd backend
npm install
npx prisma migrate dev --name init
```

### Step 4 — Start the backend

```bash
npm run dev
# Expected output:
# Server running on port 4000 [development]
```

Verify it is running:
```bash
curl http://localhost:4000/health
# → {"status":"ok","db":"connected","timestamp":"..."}
```

### Step 5 — Seed demo data

```bash
npm run db:seed
# ✅  Seed complete
#    User : demo@example.com
#    Pass : Demo@1234
#    Projects : 2
#    Tasks    : 5
```

### Step 6 — Configure and start the frontend (web)

```bash
cd ../frontend
cp .env.example .env.local
# .env.local should contain:
# NEXT_PUBLIC_API_URL=http://localhost:4000

npm install
npm run dev
# Open http://localhost:3000
```

### Step 7 — Configure and start the mobile app

For **Android emulator**:
```bash
cd ../mobile
cp .env.example .env
# .env should contain:
# EXPO_PUBLIC_API_URL=http://10.0.2.2:4000
```

For **physical device** (replace with your machine's LAN IP):
```
EXPO_PUBLIC_API_URL=http://192.168.x.x:4000
```

```bash
npm install
npx expo start --android
```

---

## Running Tests

```bash
cd backend
npm test
```

Tests use the real database (not mocks). All 3 test files run: auth, projects, tasks. Each file creates unique users, then cleans them up.

To run a single test file:
```bash
npx jest tests/auth.test.js --runInBand
```

---

## Verification Checklist (fresh clone)

Run these steps after setup to confirm everything works end-to-end:

1. **Health check** — `curl http://localhost:4000/health` → `{"status":"ok","db":"connected",...}`
2. **Web login** — Open http://localhost:3000, log in with `demo@example.com` / `Demo@1234`
3. **Dashboard loads** — 5 stat cards visible (Total Projects = 2, Total Tasks = 5)
4. **Projects list** — 2 projects shown (Website Redesign, Mobile App MVP)
5. **Project detail** — Click a project, tasks appear with status/priority badges
6. **Create a project** — Click "New Project", fill form, submit → appears in list
7. **Create a task** — Open a project, click "Add Task", fill form → task appears
8. **Toggle task** — Click the checkbox on a task → status changes to Completed
9. **Delete project** — Confirm dialog appears, project and its tasks removed
10. **Rate limiting** — POST /api/auth/login more than 20× in 15 min → HTTP 429
11. **Wrong credentials** — Login with wrong password → 401 `{"error":"Invalid credentials"}`
12. **Missing JWT** — `curl http://localhost:4000/api/projects` (no token) → 401
13. **404 handler** — `curl http://localhost:4000/api/nonexistent` → 404 with JSON body
14. **Backend tests** — `cd backend && npm test` → all tests pass

---

## Production Deployment Summary

| Service | Platform | Notes |
|---------|----------|-------|
| Database | [Neon](https://neon.tech) | Free PostgreSQL; copy the connection string |
| Backend | [Render](https://render.com) | Free web service; root dir = `backend` |
| Frontend | [Vercel](https://vercel.com) | Import `frontend` folder |
| Mobile APK | [EAS Build](https://expo.dev) | `eas build --platform android --profile preview` |

**Render build command:**
```
npm install && npx prisma generate && npx prisma migrate deploy
```

**Render start command:**
```
node src/index.js
```

**Render environment variables to set:**
- `DATABASE_URL` — Neon connection string
- `JWT_SECRET` — 32+ character random string
- `NODE_ENV` — `production`
- `ALLOWED_ORIGINS` — your Vercel URL (e.g. `https://ismo.vercel.app`)

> **Cold-start warning:** Render free tier spins down after 15 min of inactivity. The first request after a cold start takes ~30 seconds. Subsequent requests are fast.

---

## Database Connection (Neon example)

1. Go to https://neon.tech → Create project → Copy connection string
2. Format: `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`
3. Paste as `DATABASE_URL` in Render environment variables
4. Render's build command runs `prisma migrate deploy` automatically on each deploy

To run migrations manually against Neon from your machine:
```bash
DATABASE_URL="postgresql://..." npx prisma migrate deploy
DATABASE_URL="postgresql://..." npm run db:seed
```
