// Vault routes: save a card, list a user's cards, delete a card.
const express = require('express');
const { body, param } = require('express-validator');
const sql = require('../db');
const logger = require('../logger');
const { handleValidation } = require('../middleware/validate');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Save a generated Q&A card to the user's vault.
router.post(
  '/save-card',
  verifyToken,
  [body('question').trim().notEmpty(), body('answer').trim().notEmpty()],
  handleValidation,
  async (req, res) => {
    try {
      const { question, answer } = req.body;
      const userId = req.user.userId;
      const saved = await sql`
        INSERT INTO saved_cards (user_id, question, answer)
        VALUES (${userId}, ${question}, ${answer})
        RETURNING id
      `;
      res.status(200).json({ message: 'Card saved to vault!', id: saved[0].id });
    } catch (error) {
      logger.error('Save error:', error);
      res.status(500).json({ error: 'Failed to save card' });
    }
  }
);

// List all of the authenticated user's saved cards, newest first.
router.get('/vault/:userId', verifyToken, async (req, res) => {
  try {
    // Scope to the token's user — a user can only read their own vault.
    const savedCards = await sql`
      SELECT * FROM saved_cards
      WHERE user_id = ${req.user.userId}
      ORDER BY created_at DESC
    `;
    res.json(savedCards);
  } catch (error) {
    logger.error('Vault fetch error:', error);
    res.status(500).json({ error: 'Could not retrieve your vault.' });
  }
});

// Delete a single card by id (only if it belongs to the authenticated user).
router.delete('/vault/:cardId', verifyToken, param('cardId').isInt(), handleValidation, async (req, res) => {
  try {
    await sql`DELETE FROM saved_cards WHERE id = ${req.params.cardId} AND user_id = ${req.user.userId}`;
    res.json({ message: 'Card removed from vault' });
  } catch (error) {
    logger.error('Delete error:', error);
    res.status(500).json({ error: 'Delete failed' });
  }
});

// Set or clear a card's deck/tag label (vault organisation).
router.patch('/vault/:cardId', verifyToken, param('cardId').isInt(), handleValidation, async (req, res) => {
  try {
    const deck = (req.body.deck || '').trim() || null;
    await sql`UPDATE saved_cards SET deck = ${deck} WHERE id = ${req.params.cardId} AND user_id = ${req.user.userId}`;
    res.json({ message: 'Deck updated', deck });
  } catch (error) {
    logger.error('Deck update error:', error);
    res.status(500).json({ error: 'Failed to update deck' });
  }
});

module.exports = router;
