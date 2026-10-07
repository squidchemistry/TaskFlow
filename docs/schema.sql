-- ISMO Project Manager – PostgreSQL schema
-- Generated from Prisma schema

CREATE TYPE "ProjectStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

CREATE TABLE "User" (
    "id"           UUID         NOT NULL DEFAULT gen_random_uuid(),
    "fullName"     TEXT         NOT NULL,
    "email"        TEXT         NOT NULL,
    "passwordHash" TEXT         NOT NULL,
    "createdAt"    TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMPTZ  NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE TABLE "Project" (
    "id"          UUID            NOT NULL DEFAULT gen_random_uuid(),
    "userId"      UUID            NOT NULL,
    "name"        TEXT            NOT NULL,
    "description" TEXT,
    "status"      "ProjectStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "startDate"   DATE,
    "endDate"     DATE,
    "createdAt"   TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMPTZ     NOT NULL,
    CONSTRAINT "Project_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE INDEX "Project_userId_idx"  ON "Project"("userId");
CREATE INDEX "Project_status_idx"  ON "Project"("status");

CREATE TABLE "Task" (
    "id"          UUID          NOT NULL DEFAULT gen_random_uuid(),
    "projectId"   UUID          NOT NULL,
    "name"        TEXT          NOT NULL,
    "description" TEXT,
    "priority"    "Priority"    NOT NULL DEFAULT 'MEDIUM',
    "status"      "TaskStatus"  NOT NULL DEFAULT 'PENDING',
    "dueDate"     DATE,
    "createdAt"   TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMPTZ   NOT NULL,
    CONSTRAINT "Task_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId")
        REFERENCES "Project"("id") ON DELETE CASCADE
);
CREATE INDEX "Task_projectId_idx" ON "Task"("projectId");
CREATE INDEX "Task_status_idx"    ON "Task"("status");
CREATE INDEX "Task_priority_idx"  ON "Task"("priority");
