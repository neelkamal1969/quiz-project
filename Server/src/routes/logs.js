// Logging & admin routes: record a search, and read recent activity logs.
const express = require('express');
const { body } = require('express-validator');
const sql = require('../db');
const logger = require('../logger');
const { handleValidation } = require('../middleware/validate');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Record a search event. Requires auth; the email comes from the token.
// Failure here is non-blocking by design (returns 200).
router.post(
  '/log-search',
  verifyToken,
  [body('topic').trim().notEmpty()],
  handleValidation,
  async (req, res) => {
    try {
      const { topic } = req.body;
      const email = req.user.email;
      await sql`INSERT INTO user_searches (email, topic) VALUES (${email}, ${topic})`;
      res.status(200).json({ status: 'logged' });
    } catch (error) {
      logger.error('Logging error:', error);
      res.status(200).json({ status: 'logging failed silently' });
    }
  }
);

// Admin: latest 100 search events, with times converted to IST.
// Requires a valid token AND admin rights (restricted to ADMIN_EMAIL when set) —
// the search log contains other users' emails (PII), so it must not be public.
router.get('/admin/logs', verifyToken, requireAdmin, async (req, res) => {
  try {
    const logs = await sql`
      SELECT
        id, email, topic,
        search_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata' as search_time
      FROM user_searches
      ORDER BY search_time DESC
      LIMIT 100
    `;
    res.json(logs);
  } catch (error) {
    logger.error('Admin logs error:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

module.exports = router;
