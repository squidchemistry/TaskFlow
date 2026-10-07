const { z } = require('zod');

const registerSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').max(100).trim(),
  email: z.string().email('Invalid email format').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

const updateMeSchema = z.object({
  full_name: z.string().min(1).max(100).trim().optional(),
  current_password: z.string().min(1).optional(),
  new_password: z.string().min(6).optional(),
}).refine(
  (d) => !(d.new_password && !d.current_password),
  { message: 'current_password is required when setting a new password', path: ['current_password'] }
);

module.exports = { registerSchema, loginSchema, updateMeSchema };
