// Google Gemini service: model access, response parsing, and a generate helper.
const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');
const config = require('./config');
const logger = require('./logger');

const genAI = new GoogleGenerativeAI(config.geminiApiKey);

// Structured-output schema: forces Gemini to return a valid JSON array of Q&A
// pairs, with the API handling all string escaping. This is what fixes the
// frequent parse failures on answers containing LaTeX/maths (\frac, \{, \to…).
const responseSchema = {
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.OBJECT,
    properties: {
      question: { type: SchemaType.STRING },
      answer: { type: SchemaType.STRING },
    },
    required: ['question', 'answer'],
  },
};

const getModel = () =>
  genAI.getGenerativeModel({
    model: config.geminiModel,
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema,
    },
  });

// Defensive parser, kept as a second safety layer. With JSON mode the text is
// already valid JSON; if anything still slips through (e.g. stray unescaped
// backslashes from LaTeX), repair them and retry once before giving up.
const parseGeminiJSON = (text) => {
  const clean0 = text.replace(/```json|```/g, '').trim();
  const match = clean0.match(/\[[\s\S]*\]/);
  const clean = match ? match[0] : clean0;

  const tryParse = (s) => {
    const parsed = JSON.parse(s);
    return Array.isArray(parsed) ? parsed : [parsed];
  };

  try {
    return tryParse(clean);
  } catch {
    try {
      // Escape any backslash that isn't a valid JSON escape lead (fixes \frac, \{, …)
      const repaired = clean.replace(/\\(?!["\\/bfnrtu])/g, '\\\\');
      return tryParse(repaired);
    } catch (err) {
      logger.error('Gemini JSON parse failed. Raw response:', text);
      throw new Error('AI did not return valid JSON');
    }
  }
};

// Run a prompt through Gemini and return the parsed Q&A array.
const generateQA = async (prompt) => {
  const model = getModel();
  const result = await model.generateContent(prompt);
  return parseGeminiJSON(result.response.text());
};

module.exports = { getModel, parseGeminiJSON, generateQA };
