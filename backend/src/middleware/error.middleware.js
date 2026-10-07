const config = require('../lib/config');
const logger = require('../utils/logger');

const errorMiddleware = (err, req, res, next) => {
  const status = err.status || 500;

  // Always log with stack in dev; omit stack in prod
  logger.error(err.message, {
    path: req.path,
    method: req.method,
    status,
    ...(config.NODE_ENV !== 'production' && { stack: err.stack }),
  });

  // Named JWT errors → 401
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' });
  }

  // CORS errors → 403
  if (err.message?.startsWith('CORS:')) {
    return res.status(403).json({ error: err.message });
  }

  // Hide internal details from clients in production
  const message =
    status >= 500 && config.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error';

  res.status(status).json({ error: message });
};

module.exports = { errorMiddleware };
