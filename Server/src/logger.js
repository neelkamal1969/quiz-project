// Minimal structured logger: timestamped, levelled console output that is
// automatically tagged with the current request's correlation id (when one is
// active — see middleware/requestContext.js). Kept dependency-free on purpose
// (no winston/pino) to stay light for a small app.
const { als } = require('./middleware/requestContext');

const ts = () => new Date().toISOString();

// `[reqId] ` prefix when inside a request context, otherwise empty.
const tag = () => {
  const store = als.getStore();
  return store ? `[${store.id}] ` : '';
};

const logger = {
  info: (...args) => console.log(`[${ts()}] [INFO] ${tag()}`, ...args),
  warn: (...args) => console.warn(`[${ts()}] [WARN] ${tag()}`, ...args),
  error: (...args) => console.error(`[${ts()}] [ERROR] ${tag()}`, ...args),
};

// Express middleware — logs method, path, status and duration for each request,
// escalating the level for slow responses (>2s) and server errors (5xx).
logger.requestLogger = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    // The 'finish' event fires outside the ALS context, so include req.id here.
    const line = `[${req.id}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms}ms)`;
    if (res.statusCode >= 500) logger.error(line);
    else if (res.statusCode >= 400 || ms > 2000) logger.warn(line);
    else logger.info(line);
  });
  next();
};

module.exports = logger;
