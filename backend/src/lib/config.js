require('dotenv').config();
const { z } = require('zod');

const schema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  PORT: z.string().default('4000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),
  // Google OAuth — optional; Google login is disabled when absent
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  CLIENT_URL: z.string().default('http://localhost:3000'),
  SERVER_URL: z.string().default('http://localhost:4000'),
});

const result = schema.safeParse(process.env);

if (!result.success) {
  console.error('\n❌  Server configuration error — invalid environment variables:\n');
  result.error.errors.forEach((e) => {
    console.error(`   ${e.path.join('.')}: ${e.message}`);
  });
  console.error('\nCheck your .env file and try again.\n');
  process.exit(1);
}

module.exports = result.data;
