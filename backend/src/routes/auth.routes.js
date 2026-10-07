const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const passport = require('../middleware/passport');
const { register, login, logout, me, updateMe } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { registerSchema, loginSchema, updateMeSchema } = require('../validators/auth.schema');
const { sign } = require('../utils/jwt');
const config = require('../lib/config');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
});

// ── Local auth ────────────────────────────────────────────────────────────────
router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, me);
router.patch('/me', authenticate, validate(updateMeSchema), updateMe);

// ── Google OAuth ──────────────────────────────────────────────────────────────
// These routes are only registered when Google credentials are configured
if (config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET) {
  router.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'], session: false })
  );

  router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: `${config.CLIENT_URL}/login?error=google` }),
    (req, res) => {
      const token = sign({ sub: req.user.id });
      // Redirect to frontend with token in URL fragment — never in query string (not logged by servers)
      res.redirect(`${config.CLIENT_URL}/auth/google/success#token=${token}`);
    }
  );
}

// Inform the frontend whether Google login is available
router.get('/providers', (req, res) => {
  res.json({
    google: !!(config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET),
  });
});

module.exports = router;
