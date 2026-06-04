// AI generation routes: /page (image/page text) and /search/:value (topic).
// Prompts are preserved verbatim from the original single-file server.
const express = require('express');
const { body, param } = require('express-validator');
const sql = require('../db');
const logger = require('../logger');
const { generateQA } = require('../gemini');
const { aiLimiter } = require('../middleware/rateLimit');
const { handleValidation } = require('../middleware/validate');
const { verifyToken, optionalAuth } = require('../middleware/auth');
const { getAdaptiveHint } = require('../adaptive');

const router = express.Router();

// Generate personalised Q&A pairs from page/image text.
router.post(
  '/page',
  verifyToken,
  aiLimiter,
  [body('pageText').trim().notEmpty().withMessage('pageText is required')],
  handleValidation,
  async (req, res) => {
    try {
      const { pageText } = req.body;
      const userId = req.user.userId;

      // Fetch user profile to personalise the prompt
      const users = await sql`
        SELECT age, gender, degree, difficulty, question_level, goal
        FROM users WHERE id = ${userId}
      `;
      const profile = users[0] || {};
      const adaptive = await getAdaptiveHint(userId);

      const prompt = `
            Act as a highly specialized Personal Academic AI Tutor.

            USER CONTEXT:
            - Age: ${profile.age || 'Not specified'}
            - Gender: ${profile.gender || 'Not specified'}
            - Academic Degree: ${profile.degree || 'General Education'}
            - Knowledge Level: ${profile.difficulty || 'Intermediate'} (Adjust technical depth accordingly)
            - Question Style: ${profile.question_level || 'Conceptual'} (Factual, Analytical, or Conceptual focus)
            - Learning Goal: ${profile.goal || 'General mastery'} (tailor examples and emphasis toward this goal)
            ${adaptive}

            CURRENT FOCUS:
            - Topic/Source Material: "${pageText}"

            TASK:
            1. Analyze the Source Material above through the lens of a ${profile.degree} curriculum.
            2. Generate all possible high-quality Question and Answer pairs.
            3. The tone should be encouraging yet academically rigorous, specifically tailored for a ${profile.age} year old student.
            4. Since the user prefers "${profile.question_level}" questions, ensure the answers provide deep ${profile.question_level} insights.

            OUTPUT GUIDELINES:
            - Return ONLY a valid JSON array.
            - No markdown formatting, no conversational filler.
            - Format:
            [
            {
                "question": "A ${profile.question_level} question about...",
                "answer": "A detailed explanation that matches the ${profile.difficulty} level..."
            }
            ]
        `;

      const data = await generateQA(prompt);
      res.json(data);
    } catch (error) {
      logger.error('AI/DB error (/page):', error);
      res.status(500).json({ error: 'Failed to generate personalized content.' });
    }
  }
);

// Generate a fixed number of Q&A pairs for a searched topic.
router.post(
  '/search/:value',
  optionalAuth,
  aiLimiter,
  [param('value').trim().notEmpty().withMessage('Search value is required')],
  handleValidation,
  async (req, res) => {
    try {
      const { value } = req.params;
      const { count } = req.body;
      const userId = req.user?.userId;

      // Personalise only when logged in; guests get a generic profile.
      const users = userId
        ? await sql`SELECT age, gender, degree, difficulty, question_level, goal FROM users WHERE id = ${userId}`
        : [];
      const p = users[0] || {};
      const adaptive = userId ? await getAdaptiveHint(userId) : '';

      const prompt = `
            You are an elite tutor for a ${p.age} year old ${p.gender || 'student'} studying ${p.degree || 'General Studies'}.
            Topic: ${value}.
            Difficulty: ${p.difficulty || 'Intermediate'}.
            Focus Area: ${p.question_level || 'Conceptual'} questions.
            Learning Goal: ${p.goal || 'general mastery'}.
            ${adaptive}

            Task: Create exactly ${count || 5} ${p.question_level || 'relevant'} style questions and answers.
            Adjust your language for a ${p.degree || 'standard'} student.

            RULES:
            - Return ONLY a JSON array.
            - No markdown formatting. No backticks. No conversational filler.
            - If text includes quotes, use single quotes inside (e.g., 'Hello').
        `;

      const data = await generateQA(prompt);
      res.json(data);
    } catch (error) {
      logger.error('Search AI Error:', error);
      res.status(500).json({ error: 'Failed to generate personalized search.' });
    }
  }
);

module.exports = router;
