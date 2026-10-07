# API Documentation

Base URL: `https://your-backend.onrender.com` (or `http://localhost:4000` locally)

> **Cold-start notice:** The Render free tier spins down after 15 min of inactivity. The first request after a cold start may take ~30 s.

All protected endpoints require the header:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Health

### GET /health
Returns API and database status. No authentication required.

**Response 200 — healthy**
```json
{ "status": "ok", "db": "connected", "timestamp": "2025-01-01T00:00:00.000Z" }
```

**Response 503 — database unreachable**
```json
{ "status": "error", "db": "disconnected", "timestamp": "2025-01-01T00:00:00.000Z" }
```

---

## Authentication

### POST /api/auth/register
Create a new user account.

**Body**
```json
{ "full_name": "Jane Smith", "email": "jane@example.com", "password": "secret123" }
```
**Response 201**
```json
{ "user": { "id": "...", "full_name": "Jane Smith", "email": "jane@example.com", "created_at": "..." }, "token": "..." }
```
**Errors:** 400 validation, 409 email taken

---

### POST /api/auth/login
**Body**
```json
{ "email": "jane@example.com", "password": "secret123" }
```
**Response 200** — same shape as register
**Errors:** 400 validation, 401 wrong credentials

---

### POST /api/auth/logout  _(auth required)_
**Response 200** `{ "message": "Logged out successfully" }`

---

### GET /api/auth/me  _(auth required)_
**Response 200**
```json
{ "id": "...", "full_name": "Jane Smith", "email": "jane@example.com", "created_at": "..." }
```

---

## Projects  _(all auth required)_

### GET /api/projects
Query params: `search` (string), `status` (NOT_STARTED | IN_PROGRESS | COMPLETED), `page` (default 1), `limit` (default 20)

**Response 200**
```json
{ "projects": [...], "total": 5, "page": 1, "limit": 20 }
```
Each project: `id, name, description, status, start_date, end_date, created_at, updated_at, task_count`

---

### GET /api/projects/:id
Includes tasks array.

**Response 200** `{ "project": { ...fields, "tasks": [...] } }`
**Errors:** 404

---

### POST /api/projects
**Body**
```json
{
  "name": "Website Redesign",
  "description": "Optional",
  "status": "NOT_STARTED",
  "start_date": "2025-01-01",
  "end_date": "2025-03-31"
}
```
**Response 201** `{ "project": {...} }`

---

### PUT /api/projects/:id
Any subset of POST body fields.
**Response 200** `{ "project": {...} }`

---

### DELETE /api/projects/:id
**Response 200** `{ "message": "Project deleted successfully" }`

---

## Tasks  _(all auth required)_

### GET /api/tasks
Query params: `search`, `status` (PENDING | IN_PROGRESS | COMPLETED), `priority` (LOW | MEDIUM | HIGH), `projectId`, `page`, `limit`

**Response 200** `{ "tasks": [...], "total": 12, "page": 1, "limit": 20 }`

---

### GET /api/tasks/:id
**Response 200** `{ "task": {...} }`

---

### POST /api/tasks
**Body**
```json
{
  "project_id": "uuid",
  "name": "Design homepage",
  "description": "Optional",
  "priority": "HIGH",
  "status": "PENDING",
  "due_date": "2025-02-28"
}
```
**Response 201** `{ "task": {...} }`
**Errors:** 400 validation, 403 project not owned by user

---

### PUT /api/tasks/:id
Any subset of POST body (except project_id).
**Response 200** `{ "task": {...} }`

---

### DELETE /api/tasks/:id
**Response 200** `{ "message": "Task deleted successfully" }`

---

## Dashboard  _(auth required)_

### GET /api/dashboard
**Response 200**
```json
{
  "total_projects": 5,
  "projects_in_progress": 2,
  "total_tasks": 18,
  "completed_tasks": 7,
  "pending_tasks": 8
}
```

---

## Error Format
All errors follow:
```json
{ "error": "Human readable message" }
```
Validation errors also include:
```json
{ "error": "Validation failed", "details": [{ "field": "email", "message": "Invalid email format" }] }
```

## Status Codes
| Code | Meaning |
|------|---------|
| 200  | OK |
| 201  | Created |
| 400  | Validation error |
| 401  | Unauthenticated |
| 403  | Forbidden (not owner) |
| 404  | Not found |
| 409  | Conflict (duplicate email) |
| 429  | Rate limited |
| 500  | Server error |
