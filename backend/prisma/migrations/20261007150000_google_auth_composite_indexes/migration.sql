-- ============================================================
-- Migration: google_auth_composite_indexes
--
-- Records schema changes applied via `prisma db push` (Google
-- OAuth fields) plus adds composite indexes that were missing.
-- Uses IF NOT EXISTS / DROP NOT NULL guards so it is safe to
-- re-run against a DB that already has the db-push changes.
-- ============================================================

-- 1. Make passwordHash nullable (Google users have no local password)
ALTER TABLE "User" ALTER COLUMN "passwordHash" DROP NOT NULL;

-- 2. Add googleId column (OAuth subject identifier)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "googleId" TEXT;

-- 3. Add avatarUrl column (profile photo from Google)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT;

-- 4. Unique index on googleId
CREATE UNIQUE INDEX IF NOT EXISTS "User_googleId_key" ON "User"("googleId");

-- 5. Composite index: Project(userId, status)
--    Speeds up getAll when filtering by both user and status
CREATE INDEX IF NOT EXISTS "Project_userId_status_idx" ON "Project"("userId", "status");

-- 6. Composite index: Task(projectId, status)
--    Speeds up task list when filtering by project + status
CREATE INDEX IF NOT EXISTS "Task_projectId_status_idx" ON "Task"("projectId", "status");

-- 7. Composite index: Task(projectId, priority)
--    Speeds up task list when filtering by project + priority
CREATE INDEX IF NOT EXISTS "Task_projectId_priority_idx" ON "Task"("projectId", "priority");
