// Centralised configuration.
// Loads environment variables once and exposes them as a typed-ish object so the
// rest of the app never reads process.env directly.
require('dotenv').config();

const config = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || 'your_super_secret_key',
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiModel: process.env.MODEL || 'gemini-1.5-flash',
  // Optional: lock CORS to this origin. If unset, all origins are allowed (dev default).
  corsOrigin: process.env.CORS_ORIGIN || null,
  // Optional: restrict /admin/logs to this email. If unset, admin logs fall back to
  // any authenticated user (with a warning) — set ADMIN_EMAIL in .env to lock it down.
  adminEmail: process.env.ADMIN_EMAIL || null,
};

// Warn (never crash) on missing/insecure values so problems are obvious in the logs.
if (!config.databaseUrl) console.warn('[config] WARNING: DATABASE_URL is not set — all database calls will fail.');
if (!config.geminiApiKey) console.warn('[config] WARNING: GEMINI_API_KEY is not set — AI generation will fail.');
if (config.jwtSecret === 'your_super_secret_key') {
  console.warn('[config] WARNING: JWT_SECRET is using the insecure default — set JWT_SECRET in .env.');
}
if (!config.adminEmail) {
  console.warn('[config] WARNING: ADMIN_EMAIL is not set — /admin/logs is open to any logged-in user. Set ADMIN_EMAIL to restrict it.');
}

module.exports = config;
