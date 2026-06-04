// JWT authentication middleware.
// Created as part of the auth-hardening track. NOTE: it is intentionally NOT applied
// to any route yet — enforcing it requires the frontend to send the token on every
// protected call first. That wiring is a separate, coordinated step.
const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../logger');

// Requires a valid Bearer token; attaches the decoded payload to req.user.
function verifyToken(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  try {
    req.user = jwt.verify(token, config.jwtSecret);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

// Attaches req.user if a valid token is present, but never blocks the request.
// Used for endpoints that work for both guests and logged-in users (e.g. search).
function optionalAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) {
    try {
      req.user = jwt.verify(token, config.jwtSecret);
    } catch {
      /* ignore an invalid token — treat as a guest */
    }
  }
  next();
}

// Restricts a route to the configured admin (config.adminEmail). Must run AFTER
// verifyToken. If no admin email is configured it allows access but warns, so the
// app keeps working until the operator opts in by setting ADMIN_EMAIL.
function requireAdmin(req, res, next) {
  if (!config.adminEmail) {
    logger.warn('[auth] admin route reached without ADMIN_EMAIL configured — allowing. Set ADMIN_EMAIL to restrict.');
    return next();
  }
  if (req.user && req.user.email === config.adminEmail) return next();
  return res.status(403).json({ error: 'Admin access required.' });
}

module.exports = { verifyToken, optionalAuth, requireAdmin };
