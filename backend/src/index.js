// Validate env vars before anything else loads
const config = require('./lib/config');
const app = require('./app');
const prisma = require('./lib/prisma');

const server = app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT} [${config.NODE_ENV}]`);
});

const shutdown = async (signal) => {
  console.log(`\nReceived ${signal} — graceful shutdown…`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Database disconnected. Bye.');
    process.exit(0);
  });
  // Force-kill if connections linger beyond 10 s
  setTimeout(() => process.exit(1), 10_000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
