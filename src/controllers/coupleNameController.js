// src/controllers/coupleNameController.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { logger } = require('../utils/logger');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL_CHAIN = ['gemini-2.5-flash-lite','gemini-2.0-flash','gemini-2.0-flash-lite','gemini-1.5-flash-8b'];

async function generateCoupleName(req, res) {
  const { name1, name2, vibe, count } = req.body;
  if (!name1 || !name2) return res.status(400).json({ error: 'Both names are required.' });
  const num = Math.min(parseInt(count) || 5, 10);

  const prompt = `You are a creative naming expert specialising in couple names — portmanteaus, blends, mashups.
PERSON 1: ${name1}
PERSON 2: ${name2}
${vibe ? `THEIR VIBE: ${vibe}` : ''}
Create ${num} unique couple name options. Mix syllables, sounds, and personality creatively.
Return ONLY valid JSON — no markdown, no explanation:
{
  "names": [
    {"name": "CoupleNameHere", "meaning": "A warm 1-2 sentence explanation of how this name was made and what it represents for them"},
    ...exactly ${num} items
  ],
  "bestPick": "The single name you recommend most and why in one sentence"
}`;

  let lastError;
  for (const modelName of MODEL_CHAIN) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result.response.text().replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(text);
      return res.json({ success: true, names: parsed.names, bestPick: parsed.bestPick });
    } catch (err) {
      logger.warn(`CoupleNameModel ${modelName} failed: ${err.message?.substring(0, 80)}`);
      lastError = err;
      if (err.message?.includes('503') || err.message?.includes('429')) await new Promise(r => setTimeout(r, 2000));
    }
  }
  res.status(500).json({ error: lastError?.message || 'AI generation failed.' });
}

module.exports = { generateCoupleName };
