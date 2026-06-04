// Express application: middleware stack, route mounting, and global handlers.
// Routers are mounted at '/' so all existing endpoint paths are unchanged.
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const logger = require('./logger');
const config = require('./config');
const sql = require('./db');
const { generalLimiter } = require('./middleware/rateLimit');
const { requestContext } = require('./middleware/requestContext');

const authRoutes = require('./routes/auth');
const aiRoutes = require('./routes/ai');
const vaultRoutes = require('./routes/vault');
const logsRoutes = require('./routes/logs');
const reviewRoutes = require('./routes/reviews');

const app = express();

// ---- Core middleware ----
app.use(helmet());
// CORS: locked to CORS_ORIGIN when set, otherwise allows all origins (dev default).
app.use(cors(config.corsOrigin ? { origin: config.corsOrigin } : {}));
// JSON body parser with an explicit size cap to reject oversized payloads.
app.use(express.json({ limit: '1mb' }));
// Assign a correlation id + open the logging context BEFORE the request logger.
app.use(requestContext);
app.use(logger.requestLogger);
app.use(generalLimiter);

// ---- Health check (server up + DB reachable) ----
app.get('/health', async (req, res) => {
  try {
    await sql`SELECT 1`;
    res.json({ status: 'ok', db: 'connected' });
  } catch {
    res.status(503).json({ status: 'degraded', db: 'unreachable' });
  }
});

// ---- Routes (paths preserved from the original server) ----
app.use('/', authRoutes); // /signup, /login, /info
app.use('/', aiRoutes); // /page, /search/:value
app.use('/', vaultRoutes); // /save-card, /vault/:userId, /vault/:cardId
app.use('/', logsRoutes); // /log-search, /admin/logs
app.use('/', reviewRoutes); // /reviews, /reviews/due, /stats

// ---- 404 handler ----
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ---- Global error handler ----
// The request id is auto-added to the log line (ALS) and to the response body
// (res.json patch in requestContext), giving the client something to quote.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${req.method} ${req.originalUrl} —`, err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
