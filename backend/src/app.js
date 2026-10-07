const config = require('./lib/config');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const passport = require('./middleware/passport');
const prisma = require('./lib/prisma');

const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/projects.routes');
const taskRoutes = require('./routes/tasks.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const { errorMiddleware } = require('./middleware/error.middleware');

const app = express();

// Trust the first proxy hop (needed for correct IP in rate limiter on Render/Heroku)
app.set('trust proxy', 1);

// Security headers
app.use(helmet());

// CORS – strip trailing slashes; never uses '*'
const allowedOrigins = config.ALLOWED_ORIGINS
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''));

app.use(
  cors({
    origin: (origin, callback) => {
      // No origin = React Native / Postman / curl — always allowed
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin.replace(/\/$/, ''))) {
        return callback(null, true);
      }
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true,
  })
);

// Global rate limit (generous — auth endpoints have their own tighter limit)
const globalLimiter = rateLimit({
  windowMs: 60 * 1_000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please slow down' },
});
app.use(globalLimiter);

// Request logging — skip auth routes so credentials never appear in logs
app.use(
  morgan(config.NODE_ENV === 'production' ? 'combined' : 'dev', {
    skip: (req) => req.path.startsWith('/api/auth') || config.NODE_ENV === 'test',
  })
);

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Passport (session: false — we use JWT, not server-side sessions)
app.use(passport.initialize());

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'error', db: 'disconnected', timestamp: new Date().toISOString() });
  }
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `${req.method} ${req.path} not found` });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorMiddleware);

module.exports = app;
