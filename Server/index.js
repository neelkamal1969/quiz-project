// Server entry point.
// Loads config, runs idempotent migrations, then starts the HTTP server.
// All application logic lives in ./src (app, routes, middleware, services).
const config = require('./src/config');
const logger = require('./src/logger');
const migrate = require('./src/migrate');
const app = require('./src/app');

async function start() {
  // Verify/create the schema before serving. Non-fatal: if the DB is unreachable
  // the server still boots (errors then surface per-request, as before).
  try {
    await migrate.run();
  } catch (err) {
    logger.error('Migration failed (continuing to start server):', err.message);
  }

  app.listen(config.port, () => {
    logger.info(`🚀 Server running securely on port ${config.port}`);
    logger.info('✅ Security features (Helmet, Rate Limiting, Validation) are active');
  });
}

start();
