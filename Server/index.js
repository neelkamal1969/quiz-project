
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { neon } = require('@neondatabase/serverless');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
const cors = require('cors');

// Security middleware
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, param, validationResult } = require('express-validator');

const sql = neon(process.env.DATABASE_URL);
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

const app = express();
const port = process.env.PORT || 3000;

// ======================== MIDDLEWARE ========================
app.use(helmet());
app.use(cors());
app.use(express.json());

// General rate limiter for all routes
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,   // 15 minutes
    max: 100,
    message: { error: "Too many requests. Please try again later." }
});
app.use(generalLimiter);

// Strict rate limiter for AI endpoints (protects Gemini quota)
const aiLimiter = rateLimit({
    windowMs: 60 * 1000,        // 1 minute
    max: 10,
    message: { error: "Too many AI requests. Please wait 60 seconds." }
});

// ======================== GEMINI INITIALIZATION ========================
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ======================== HELPER FUNCTION ========================
// Safe JSON parser for Gemini responses
const parseGeminiJSON = (text) => {
    try {
        // Remove code blocks and trim
        let clean = text.replace(/```json|```/g, '').trim();
        
        // Extract JSON array if present
        const match = clean.match(/\[[\s\S]*\]/);
        if (match) clean = match[0];

        const parsed = JSON.parse(clean);
        
        // Ensure it's always an array
        return Array.isArray(parsed) ? parsed : [parsed];
    } catch (err) {
        console.error("JSON Parse Failed. Raw response:", text);
        throw new Error("AI did not return valid JSON");
    }
};

// ======================== AI ENDPOINTS ========================

// POST /page - Used for picture/text input (your original detailed prompt)
app.post('/page', aiLimiter, [
    body('userId').optional().isInt().withMessage('userId must be a valid number'),
    body('pageText').trim().notEmpty().withMessage('pageText is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Validation failed", details: errors.array() });
    }

    try {
        const { pageText, userId } = req.body;

        // Fetch user profile
        const users = await sql`
            SELECT age, gender, degree, difficulty, question_level, goal 
            FROM users WHERE id = ${userId}
        `;
        const profile = users[0] || {};

        const model_name = process.env.MODEL || "gemini-1.5-flash";
        const model = genAI.getGenerativeModel({ model: model_name });

        const prompt = `
            Act as a highly specialized Personal Academic AI Tutor.
            
            USER CONTEXT:
            - Age: ${profile.age || 'Not specified'}
            - Gender: ${profile.gender || 'Not specified'}
            - Academic Degree: ${profile.degree || 'General Education'}
            - Knowledge Level: ${profile.difficulty || 'Intermediate'} (Adjust technical depth accordingly)
            - Question Style: ${profile.question_level || 'Conceptual'} (Factual, Analytical, or Conceptual focus)
            
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

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        const data = parseGeminiJSON(text);
        res.json(data);

    } catch (error) {
        console.error("AI/DB Error (/page):", error);
        res.status(500).json({ error: "Failed to generate personalized content." });
    }
});

// POST /search/:value
app.post('/search/:value', aiLimiter, [
    param('value').trim().notEmpty().withMessage('Search value is required'),
    body('userId').optional().isInt().withMessage('userId must be a valid number')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Validation failed", details: errors.array() });
    }

    try {
        const { value } = req.params;
        const { userId, count } = req.body;

        const users = await sql`SELECT age, gender, degree, difficulty, question_level, goal FROM users WHERE id = ${userId}`;
        const p = users[0] || {};

        const model_name = process.env.MODEL || "gemini-1.5-flash";
        const model = genAI.getGenerativeModel({ model: model_name });

        const prompt = `
            You are an elite tutor for a ${p.age} year old ${p.gender || 'student'} studying ${p.degree || 'General Studies'}.
            Topic: ${value}.
            Difficulty: ${p.difficulty || 'Intermediate'}.
            Focus Area: ${p.question_level || 'Conceptual'} questions.
            
            Task: Create exactly ${count || 5} ${p.question_level || 'relevant'} style questions and answers. 
            Adjust your language for a ${p.degree || 'standard'} student.
            
            RULES:
            - Return ONLY a JSON array. 
            - No markdown formatting. No backticks. No conversational filler.
            - If text includes quotes, use single quotes inside (e.g., 'Hello').
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        const data = parseGeminiJSON(text);
        res.json(data);

    } catch (error) {
        console.error("Search AI Error:", error);
        res.status(500).json({ error: "Failed to generate personalized search." });
    }
});

// ======================== AUTH & USER ENDPOINTS ========================

app.post('/signup', [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: "Validation failed", details: errors.array() });

    try {
        const { email, password } = req.body;

        const existingUser = await sql`SELECT * FROM users WHERE email = ${email}`;
        if (existingUser.length > 0) {
            return res.status(409).json({ error: "User already exists with this email." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await sql`
            INSERT INTO users (email, password) 
            VALUES (${email}, ${hashedPassword}) 
            RETURNING id, email
        `;

        res.status(201).json({ message: "User created successfully", user: newUser[0] });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ error: "Internal server error during signup." });
    }
});

app.post('/login', [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: "Validation failed", details: errors.array() });

    try {
        const { email, password } = req.body;

        const users = await sql`SELECT * FROM users WHERE email = ${email}`;
        if (users.length === 0) return res.status(401).json({ error: "Invalid email or password." });

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: "Invalid email or password." });

        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

        res.json({
            message: "Login successful",
            token,
            user: { id: user.id, email: user.email }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Internal server error during login." });
    }
});

app.post('/info', [
    body('userId').isInt()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: "Validation failed", details: errors.array() });

    try {
        const { age, gender, degree, difficulty, question_level, userId } = req.body;

        const result = await sql`
            UPDATE users 
            SET 
                age = COALESCE(${age || null}, age), 
                gender = COALESCE(${gender || null}, gender),
                degree = COALESCE(${degree || null}, degree), 
                difficulty = COALESCE(${difficulty || null}, difficulty), 
                question_level = COALESCE(${question_level || null}, question_level)
            WHERE id = ${userId}
            RETURNING *
        `;

        res.json({ message: "Profile updated successfully!", user: result[0] });
    } catch (error) {
        console.error("Profile Update Error:", error);
        res.status(500).json({ error: "Failed to update profile preferences." });
    }
});

// ======================== VAULT ENDPOINTS ========================

app.post('/save-card', [
    body('userId').isInt(),
    body('question').trim().notEmpty(),
    body('answer').trim().notEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: "Validation failed", details: errors.array() });

    try {
        const { userId, question, answer } = req.body;
        const saved = await sql`
            INSERT INTO saved_cards (user_id, question, answer)
            VALUES (${userId}, ${question}, ${answer})
            RETURNING id
        `;
        res.status(200).json({ message: "Card saved to vault!", id: saved[0].id });
    } catch (error) {
        console.error("Save Error:", error);
        res.status(500).json({ error: "Failed to save card" });
    }
});

app.get('/vault/:userId', param('userId').isInt(), async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: "Validation failed", details: errors.array() });

    try {
        const savedCards = await sql`
            SELECT * FROM saved_cards 
            WHERE user_id = ${req.params.userId} 
            ORDER BY created_at DESC
        `;
        res.json(savedCards);
    } catch (error) {
        console.error("Vault Fetch Error:", error);
        res.status(500).json({ error: "Could not retrieve your vault." });
    }
});

app.delete('/vault/:cardId', param('cardId').isInt(), async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: "Validation failed", details: errors.array() });

    try {
        await sql`DELETE FROM saved_cards WHERE id = ${req.params.cardId}`;
        res.json({ message: "Card removed from vault" });
    } catch (error) {
        res.status(500).json({ error: "Delete failed" });
    }
});

// ======================== LOGGING ENDPOINTS ========================

app.post('/log-search', [
    body('email').isEmail().normalizeEmail(),
    body('topic').trim().notEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: "Validation failed", details: errors.array() });

    try {
        const { email, topic } = req.body;
        await sql`INSERT INTO user_searches (email, topic) VALUES (${email}, ${topic})`;
        res.status(200).json({ status: "logged" });
    } catch (error) {
        console.error("Logging Error:", error);
        res.status(200).json({ status: "logging failed silently" });
    }
});

app.get('/admin/logs', async (req, res) => {
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
        res.status(500).json({ error: "Failed to fetch logs" });
    }
});

// ======================== GLOBAL HANDLERS ========================
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
    console.error("Unhandled Server Error:", err);
    res.status(500).json({ error: "Internal server error" });
});

// ======================== START SERVER ========================
app.listen(port, () => {
    console.log(`🚀 Server running securely on port ${port}`);
    console.log(`✅ Security features (Helmet, Rate Limiting, Validation) are active`);
});