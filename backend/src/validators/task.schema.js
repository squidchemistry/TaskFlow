const { z } = require('zod');

const createTaskSchema = z.object({
  project_id: z.string().uuid('project_id must be a valid UUID'),
  name: z.string().min(1, 'Name is required').max(200).trim(),
  description: z.string().max(2000).optional().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
  due_date: z.string().nullable().optional(),
});

const updateTaskSchema = z.object({
  name: z.string().min(1).max(200).trim().optional(),
  description: z.string().max(2000).optional().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
  due_date: z.string().nullable().optional(),
});

module.exports = { createTaskSchema, updateTaskSchema };
