const { GoogleGenAI } = require('@google/genai');

const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;
if (!ai) console.warn('[ai] GEMINI_API_KEY missing - chat will use fallback replies');

module.exports = { ai, MODEL: 'gemini-2.5-flash' };
