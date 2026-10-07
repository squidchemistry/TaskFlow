const { z } = require('zod');

const projectStatusEnum = z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']);

const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200).trim(),
  description: z.string().max(2000).optional().nullable(),
  status: projectStatusEnum.optional(),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
});

const updateProjectSchema = createProjectSchema.partial();

module.exports = { createProjectSchema, updateProjectSchema };
