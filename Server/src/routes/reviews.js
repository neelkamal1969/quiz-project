// Spaced-repetition + study-stats routes (Phase 3).
const express = require('express');
const { body } = require('express-validator');
const sql = require('../db');
const logger = require('../logger');
const { handleValidation } = require('../middleware/validate');
const { verifyToken } = require('../middleware/auth');
const { sm2, confidenceToQuality } = require('../sm2');

const router = express.Router();

// Record a review for one of the user's saved cards and schedule the next via SM-2.
// Accepts either `quality` (0–5) or the app's `confidence` (1–4).
router.post(
  '/reviews',
  verifyToken,
  [
    body('cardId').isInt(),
    body('quality').optional().isInt({ min: 0, max: 5 }),
    body('confidence').optional().isInt({ min: 1, max: 4 }),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const userId = req.user.userId;
      const { cardId } = req.body;
      const quality = req.body.quality != null ? req.body.quality : confidenceToQuality(req.body.confidence);

      // Ensure the card belongs to this user.
      const owned = await sql`SELECT id FROM saved_cards WHERE id = ${cardId} AND user_id = ${userId}`;
      if (owned.length === 0) return res.status(404).json({ error: 'Card not found' });

      // Load any existing review state.
      const rows = await sql`
        SELECT ease_factor, interval_days, repetitions
        FROM card_reviews WHERE user_id = ${userId} AND card_id = ${cardId}
      `;
      const prev = rows[0]
        ? { easeFactor: Number(rows[0].ease_factor), intervalDays: rows[0].interval_days, repetitions: rows[0].repetitions }
        : {};

      const next = sm2(prev, quality);

      await sql`
        INSERT INTO card_reviews
          (user_id, card_id, ease_factor, interval_days, repetitions, due_date, last_reviewed, last_quality)
        VALUES
          (${userId}, ${cardId}, ${next.easeFactor}, ${next.intervalDays}, ${next.repetitions}, ${next.dueDate.toISOString()}, now(), ${quality})
        ON CONFLICT (user_id, card_id) DO UPDATE SET
          ease_factor   = ${next.easeFactor},
          interval_days = ${next.intervalDays},
          repetitions   = ${next.repetitions},
          due_date      = ${next.dueDate.toISOString()},
          last_reviewed = now(),
          last_quality  = ${quality}
      `;

      // Touch study streak (best-effort, non-blocking on failure).
      try {
        await sql`
          INSERT INTO user_stats (user_id, current_streak, longest_streak, last_studied, total_reviews)
          VALUES (${userId}, 1, 1, CURRENT_DATE, 1)
          ON CONFLICT (user_id) DO UPDATE SET
            total_reviews = user_stats.total_reviews + 1,
            current_streak = CASE
              WHEN user_stats.last_studied = CURRENT_DATE THEN user_stats.current_streak
              WHEN user_stats.last_studied = CURRENT_DATE - 1 THEN user_stats.current_streak + 1
              ELSE 1 END,
            longest_streak = GREATEST(
              user_stats.longest_streak,
              CASE
                WHEN user_stats.last_studied = CURRENT_DATE THEN user_stats.current_streak
                WHEN user_stats.last_studied = CURRENT_DATE - 1 THEN user_stats.current_streak + 1
                ELSE 1 END),
            last_studied = CURRENT_DATE
        `;
      } catch (e) {
        logger.warn('Streak update failed (non-fatal):', e.message);
      }

      res.json({ ok: true, due_date: next.dueDate, interval_days: next.intervalDays, repetitions: next.repetitions });
    } catch (e) {
      logger.error('Review error:', e);
      res.status(500).json({ error: 'Failed to record review' });
    }
  }
);

// Cards due for review now (never-reviewed cards count as due).
router.get('/reviews/due', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const due = await sql`
      SELECT c.id, c.question, c.answer, r.due_date, r.repetitions
      FROM saved_cards c
      LEFT JOIN card_reviews r ON r.card_id = c.id AND r.user_id = c.user_id
      WHERE c.user_id = ${userId} AND (r.due_date IS NULL OR r.due_date <= now())
      ORDER BY r.due_date ASC NULLS FIRST
    `;
    res.json(due);
  } catch (e) {
    logger.error('Due-cards error:', e);
    res.status(500).json({ error: 'Failed to fetch due cards' });
  }
});

// Aggregate study stats for the analytics dashboard (all real, no fabrication).
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const [cards] = await sql`SELECT COUNT(*)::int AS c FROM saved_cards WHERE user_id = ${userId}`;
    const reviewedRows = await sql`SELECT repetitions FROM card_reviews WHERE user_id = ${userId}`;
    const [due] = await sql`
      SELECT COUNT(*)::int AS c
      FROM saved_cards c
      LEFT JOIN card_reviews r ON r.card_id = c.id AND r.user_id = c.user_id
      WHERE c.user_id = ${userId} AND (r.due_date IS NULL OR r.due_date <= now())
    `;
    const statsRow = await sql`SELECT current_streak, longest_streak, last_studied, total_reviews FROM user_stats WHERE user_id = ${userId}`;
    const [aq] = await sql`SELECT COALESCE(AVG(last_quality), 0)::float AS q FROM card_reviews WHERE user_id = ${userId}`;
    const forecast = await sql`
      SELECT to_char(due_date, 'YYYY-MM-DD') AS day, COUNT(*)::int AS count
      FROM card_reviews
      WHERE user_id = ${userId} AND due_date >= now() AND due_date < now() + interval '7 days'
      GROUP BY day ORDER BY day
    `;

    // Mastery buckets by SM-2 repetition count (cards never reviewed = "new").
    const reviewedCount = reviewedRows.length;
    const mastery = { new: Math.max(0, cards.c - reviewedCount), learning: 0, young: 0, mature: 0 };
    reviewedRows.forEach((r) => {
      if (r.repetitions <= 2) mastery.learning += 1;
      else if (r.repetitions <= 4) mastery.young += 1;
      else mastery.mature += 1;
    });

    res.json({
      totalCards: cards.c,
      reviewedCards: reviewedCount,
      totalReviews: statsRow[0]?.total_reviews || 0,
      dueNow: due.c,
      currentStreak: statsRow[0]?.current_streak || 0,
      longestStreak: statsRow[0]?.longest_streak || 0,
      lastStudied: statsRow[0]?.last_studied || null,
      avgQuality: Number((aq.q || 0).toFixed(2)),
      mastery,
      forecast, // [{ day: 'YYYY-MM-DD', count }]
    });
  } catch (e) {
    logger.error('Stats error:', e);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Record a completed quiz/study session (counts toward the daily streak).
router.post(
  '/sessions',
  verifyToken,
  [body('total').isInt({ min: 0 }), body('score').isInt({ min: 0 })],
  handleValidation,
  async (req, res) => {
    try {
      const userId = req.user.userId;
      const { total, score } = req.body;
      const kind = (req.body.kind || 'quiz').slice(0, 40);
      const topic = req.body.topic ? String(req.body.topic).slice(0, 200) : null;

      await sql`
        INSERT INTO study_sessions (user_id, kind, topic, total, score)
        VALUES (${userId}, ${kind}, ${topic}, ${total}, ${score})
      `;

      try {
        await sql`
          INSERT INTO user_stats (user_id, current_streak, longest_streak, last_studied)
          VALUES (${userId}, 1, 1, CURRENT_DATE)
          ON CONFLICT (user_id) DO UPDATE SET
            current_streak = CASE
              WHEN user_stats.last_studied = CURRENT_DATE THEN user_stats.current_streak
              WHEN user_stats.last_studied = CURRENT_DATE - 1 THEN user_stats.current_streak + 1
              ELSE 1 END,
            longest_streak = GREATEST(
              user_stats.longest_streak,
              CASE
                WHEN user_stats.last_studied = CURRENT_DATE THEN user_stats.current_streak
                WHEN user_stats.last_studied = CURRENT_DATE - 1 THEN user_stats.current_streak + 1
                ELSE 1 END),
            last_studied = CURRENT_DATE
        `;
      } catch (e) {
        logger.warn('Streak update (session) failed:', e.message);
      }

      res.json({ ok: true });
    } catch (e) {
      logger.error('Session error:', e);
      res.status(500).json({ error: 'Failed to save session' });
    }
  }
);

module.exports = router;
