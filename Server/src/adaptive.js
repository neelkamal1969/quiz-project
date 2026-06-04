// Adaptive difficulty: derive a prompt instruction from the user's recent recall
// performance (avg SM-2 quality over their latest reviews). Returns '' when there
// isn't enough history yet, so brand-new users get the normal profile-based prompt.
const sql = require('./db');
const logger = require('./logger');

async function getAdaptiveHint(userId) {
  if (!userId) return '';
  try {
    const rows = await sql`
      SELECT last_quality
      FROM card_reviews
      WHERE user_id = ${userId} AND last_quality IS NOT NULL
      ORDER BY last_reviewed DESC NULLS LAST
      LIMIT 20
    `;
    if (rows.length < 3) return ''; // not enough signal yet

    const avg = rows.reduce((s, r) => s + r.last_quality, 0) / rows.length;
    const a = avg.toFixed(1);

    if (avg >= 4) {
      return `ADAPTIVE CALIBRATION: This student has been recalling recent material very well (avg ${a}/5 over ${rows.length} reviews). Raise the challenge a notch — favour deeper, multi-step, application and edge-case questions that genuinely stretch them.`;
    }
    if (avg <= 2.5) {
      return `ADAPTIVE CALIBRATION: This student has been struggling with recent material (avg ${a}/5 over ${rows.length} reviews). Ease the difficulty — reinforce fundamentals with clearer, well-scaffolded questions and step-by-step, encouraging answers.`;
    }
    return `ADAPTIVE CALIBRATION: This student's recent recall is steady (avg ${a}/5). Keep difficulty balanced — mix reinforcement of core ideas with a few slightly harder questions.`;
  } catch (e) {
    logger.warn('Adaptive hint failed (non-fatal):', e.message);
    return '';
  }
}

module.exports = { getAdaptiveHint };
