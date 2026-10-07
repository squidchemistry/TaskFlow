# TaskFlow – Project Management System

A full-stack project and task management app with a shared REST API powering both a **Next.js web app** and a **React Native (Expo) mobile app**.

**Live Demo:** `https://task-flow-gamma-ochre.vercel.app/` · **Demo login:** ` demo@example.com / Demo@1234`

---

## Features

- **Authentication** — Register/login/logout with JWT; bcrypt-hashed passwords; one account works on web and mobile
- **Projects** — Create, view, edit, delete; filter by status; search by name
- **Tasks** — Create, edit, delete, complete tasks per project; filter by status & priority; search by name
- **Dashboard** — Real-time stats: total projects, in-progress, total/completed/pending tasks
- **Security** — JWT auth middleware, per-user data isolation, input validation, rate limiting, SQL injection prevention via ORM
- **Mobile** — Secure token storage (Android Keystore via Expo SecureStore), pull-to-refresh, offline error handling, token expiry redirect
- **Docker** — Single `docker-compose up` runs everything locally

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express 4 |
| ORM | Prisma 5 + PostgreSQL |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Validation | Zod |
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| Mobile | React Native + Expo SDK 51 |
| Secure Storage | Expo SecureStore (Android Keystore) |
| Deployment | Render (API) · Neon (DB) · Vercel (Web) · EAS Build (APK) |

---

## Architecture

```
┌─────────────┐    ┌─────────────┐
│  Next.js    │    │ React Native│
│  Web App    │    │ (Expo) App  │
└──────┬──────┘    └──────┬──────┘
       │                  │
       └────────┬─────────┘
                │  REST API (JWT)
         ┌──────▼──────┐
         │   Express   │
         │   Backend   │
         └──────┬──────┘
                │  Prisma ORM
         ┌──────▼──────┐
         │  PostgreSQL │
         └─────────────┘
```

---

## Quick Start

### Prerequisites
- Node.js 20+, npm
- PostgreSQL database (or Docker)

---

### Option A — Docker (recommended for local dev)

```bash
git clone https://github.com/YOUR_USERNAME/ISMO.git
cd ISMO
docker-compose up --build
```
- Web: http://localhost:3000
- API: http://localhost:4000
- DB: localhost:5432

---

### Option B — Manual Setup

#### 1. Backend
```bash
cd backend
cp .env.example .env
# Edit .env: set DATABASE_URL and JWT_SECRET
npm install
npx prisma migrate dev --name init
npm run dev
```

#### 2. Frontend (web)
```bash
cd frontend
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:4000
npm install
npm run dev
```
Open http://localhost:3000

#### 3. Mobile
```bash
cd mobile
cp .env.example .env
# For emulator: EXPO_PUBLIC_API_URL=http://10.0.2.2:4000
# For physical device: EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:4000
npm install
npx expo start --android
```

---

## Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db` |
| `JWT_SECRET` | Random secret ≥ 32 chars | `super_secret_key_here` |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `PORT` | Server port | `4000` |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins | `https://app.vercel.app` |

### Frontend (`frontend/.env.local`)
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend URL |

### Mobile (`mobile/.env`)
| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_API_URL` | Backend URL (use `10.0.2.2` for Android emulator) |

---

## Database Setup

1. Create a PostgreSQL database (or use [Neon](https://neon.tech) free tier)
2. Set `DATABASE_URL` in `backend/.env`
3. Run migrations:
   ```bash
   cd backend
   npx prisma migrate deploy   # production
   # OR
   npx prisma migrate dev       # development (also seeds)
   ```

---

## Running Tests

```bash
cd backend
npm test
```
Runs Jest integration tests against a real database. Requires `DATABASE_URL` to be set.

---

## Deployment

### Backend → Render

1. Create a new **Web Service** on [render.com](https://render.com)
2. Root directory: `backend`
3. Build command: `npm install && npx prisma generate && npx prisma migrate deploy`
4. Start command: `node src/index.js`
5. Add environment variables: `DATABASE_URL`, `JWT_SECRET`, `ALLOWED_ORIGINS`, `NODE_ENV=production`

### Database → Neon

1. Create a project at [neon.tech](https://neon.tech)
2. Copy the connection string and set as `DATABASE_URL` in Render

### Frontend → Vercel

1. Import the `frontend` folder in [vercel.com](https://vercel.com)
2. Set environment variable: `NEXT_PUBLIC_API_URL=https://your-render-url.onrender.com`
3. Deploy

### Mobile APK → EAS Build

```bash
cd mobile
npm install -g eas-cli
eas login
eas build:configure
# Update EXPO_PUBLIC_API_URL in app.json extras or use eas.json secrets
eas build --platform android --profile preview
```
Download the APK from the Expo dashboard and install on Android.

---

## Demo Credentials

Seed the database to get a ready-to-use demo account with 2 projects and 5 tasks:

```bash
cd backend
npm run db:seed
```

| Field | Value |
|-------|-------|
| Email | `demo@example.com` |
| Password | `Demo@1234` |

> **Note:** The seed script is idempotent — re-running it deletes and recreates the demo user.

---

## API Reference

See [docs/api-docs.md](docs/api-docs.md) for the full endpoint reference.

## Database Schema

See [docs/schema.sql](docs/schema.sql) and [docs/er-diagram.md](docs/er-diagram.md).

---

## Project Structure

```
ISMO/
├── backend/            Express API + Prisma
│   ├── prisma/         Schema + migrations
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── validators/
│   │   └── utils/
│   └── tests/          Jest integration tests
├── frontend/           Next.js 14 web app
│   └── src/
│       ├── app/        App Router pages
│       ├── components/
│       ├── context/
│       └── lib/
├── mobile/             React Native (Expo) app
│   └── src/
│       ├── screens/
│       ├── navigation/
│       ├── services/
│       └── context/
├── docs/               ER diagram, SQL schema, API docs
└── docker-compose.yml
```

---

## Security Highlights

- Passwords hashed with bcrypt (cost 12)
- JWT signed with HS256; 7-day expiry
- Constant-time login (dummy bcrypt compare when user not found — prevents timing-based enumeration)
- All project/task endpoints verify ownership before any operation; 404 (not 403) returned on missing ownership to avoid info leakage
- Input validated on every endpoint with Zod
- Prisma ORM prevents SQL injection
- Rate limiter: 20 requests / 15 min on auth endpoints; 300 requests / 60 s global limit
- CORS restricted to configured origins; mobile apps (no origin header) always allowed
- HTTP security headers via Helmet (X-Frame-Options, CSP, HSTS, etc.)
- Content-Security-Policy and X-Frame-Options: DENY on Next.js frontend
- `passwordHash` never returned in any API response
- Stack traces hidden from API responses in production (`NODE_ENV=production`)
- Environment variables validated at startup — server refuses to start if misconfigured
- Secrets in `.env`; `.env.example` committed; `.env` in `.gitignore`

## Known Limitations

- The Render free tier spins down after 15 minutes of inactivity. The first request after a cold start takes ~30 seconds. Subsequent requests are fast.
- Mobile token refresh is one-shot (no silent refresh): an expired token redirects to Login.
- No email verification on registration.
- No password reset flow.
