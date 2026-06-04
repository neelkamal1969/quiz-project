// Rate limiters. Behaviour preserved from the original single-file server.
const rateLimit = require('express-rate-limit');

// General limiter applied to every route: 100 requests / 15 minutes.
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests. Please try again later.' },
});

// Strict limiter for AI endpoints to protect the Gemini quota: 10 requests / minute.
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Too many AI requests. Please wait 60 seconds.' },
});

// Strict limiter for auth endpoints to slow brute-force / credential stuffing:
// 10 *failed* attempts per 15 minutes. Successful logins don't count, so a
// legitimate user logging in repeatedly is never locked out.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  message: { error: 'Too many attempts. Please try again in 15 minutes.' },
});

module.exports = { generalLimiter, aiLimiter, authLimiter };
