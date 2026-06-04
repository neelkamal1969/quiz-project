// Auth & user routes: /signup, /login, /info.
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const sql = require('../db');
const config = require('../config');
const logger = require('../logger');
const { handleValidation } = require('../middleware/validate');
const { verifyToken } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');

const router = express.Router();

// Precomputed valid bcrypt hash, used to equalize response time when an email
// doesn't exist — mitigates user enumeration via timing. Computed once at startup.
const DUMMY_HASH = bcrypt.hashSync('studyai-timing-equalizer', 10);

// Create a new account with a bcrypt-hashed password.
router.post(
  '/signup',
  authLimiter,
  [body('email').isEmail().normalizeEmail(), body('password').isLength({ min: 6 })],
  handleValidation,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      const existingUser = await sql`SELECT id FROM users WHERE email = ${email}`;
      if (existingUser.length > 0) {
        return res.status(409).json({ error: 'User already exists with this email.' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = await sql`
        INSERT INTO users (email, password)
        VALUES (${email}, ${hashedPassword})
        RETURNING id, email
      `;

      res.status(201).json({ message: 'User created successfully', user: newUser[0] });
    } catch (error) {
      logger.error('Signup error:', error);
      res.status(500).json({ error: 'Internal server error during signup.' });
    }
  }
);

// Verify credentials and return a signed JWT (24h expiry).
router.post(
  '/login',
  authLimiter,
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  handleValidation,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      const users = await sql`SELECT * FROM users WHERE email = ${email}`;
      if (users.length === 0) {
        // Equalize timing with the bcrypt.compare path below so response time
        // doesn't reveal whether the email exists (user enumeration).
        await bcrypt.compare(password, DUMMY_HASH);
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const user = users[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ error: 'Invalid email or password.' });

      const token = jwt.sign({ userId: user.id, email: user.email }, config.jwtSecret, { expiresIn: '24h' });

      res.json({
        message: 'Login successful',
        token,
        user: { id: user.id, email: user.email },
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error during login.' });
    }
  }
);

// Update profile preferences. COALESCE keeps any field the client leaves blank.
// Requires auth; the user id comes from the token, never the request body.
router.post(
  '/info',
  verifyToken,
  [
    body('age').optional({ nullable: true, checkFalsy: true }).isInt({ min: 5, max: 120 }).withMessage('Age must be between 5 and 120.'),
    body('gender').optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 30 }),
    body('degree').optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 100 }),
    body('difficulty').optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 30 }),
    body('question_level').optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 30 }),
    body('goal').optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 250 }),
  ],
  handleValidation,
  async (req, res) => {
  try {
    const { age, gender, degree, difficulty, question_level, goal } = req.body;
    const userId = req.user.userId;

    // Return only non-sensitive columns — never the password hash.
    const result = await sql`
      UPDATE users
      SET
        age = COALESCE(${age || null}, age),
        gender = COALESCE(${gender || null}, gender),
        degree = COALESCE(${degree || null}, degree),
        difficulty = COALESCE(${difficulty || null}, difficulty),
        question_level = COALESCE(${question_level || null}, question_level),
        goal = COALESCE(${goal || null}, goal)
      WHERE id = ${userId}
      RETURNING id, email, age, gender, degree, difficulty, question_level, goal
    `;

    res.json({ message: 'Profile updated successfully!', user: result[0] });
  } catch (error) {
    logger.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile preferences.' });
  }
});

module.exports = router;
