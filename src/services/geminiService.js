const { GoogleGenerativeAI } = require('@google/generative-ai');
const { logger } = require('../utils/logger');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Fallback chain — all free, tries in order until one works
const MODEL_CHAIN = [
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash-8b',
];

const STYLE_GUIDES = {
  Romantic: 'deeply romantic, heartfelt, passionate, and tender',
  Poetic: 'lyrical, metaphor-rich, poetic with beautiful imagery and rhythm',
  'Deep Emotional': 'profoundly emotional, vulnerable, raw and deeply moving',
  Funny: 'warm, witty, playful with loving humor and inside jokes',
  Cute: 'adorable, sweet, lighthearted and utterly charming',
  Elegant: 'sophisticated, refined, classic and beautifully composed',
  Proposal: 'culminating in a heartfelt marriage proposal, deeply sincere',
  Anniversary: 'celebrating shared history, growth and enduring love',
  Apology: 'sincere, remorseful, healing and full of hope for renewal',
  'Long Distance': 'aching with longing, hopeful, celebrating connection across distance'
};

const LENGTH_GUIDES = {
  Short: '200-300 words for the main letter',
  Medium: '400-600 words for the main letter',
  Long: '700-1000 words for the main letter',
  'Very Long': '1200-1800 words for the main letter'
};

function buildPrompt(data) {
  const styleGuide = STYLE_GUIDES[data.writingStyle] || STYLE_GUIDES.Romantic;
  const lengthGuide = LENGTH_GUIDES[data.letterLength] || LENGTH_GUIDES.Long;
  const numPhotos = data.images?.length || 0;

  return {
    prompt: `You are a master romantic storyteller creating a deeply personal cinematic love experience.

RECIPIENT: ${data.recipientName}
SENDER: ${data.senderName}
${data.nickname ? `NICKNAME: ${data.nickname}` : ''}
OCCASION: ${data.occasion || 'Love Letter'}
${data.relationshipDuration ? `TOGETHER FOR: ${data.relationshipDuration}` : ''}
${data.favoritePlace ? `FAVORITE PLACE: ${data.favoritePlace}` : ''}
${data.futureDream ? `FUTURE DREAM: ${data.futureDream}` : ''}
${data.firstDate ? `FIRST DATE: ${data.firstDate}` : ''}

THEIR STORY:
${data.howMet ? `How they met: ${data.howMet}` : ''}
${data.loveMost ? `What sender loves most: ${data.loveMost}` : ''}
${data.favoriteMemory ? `Favorite memory: ${data.favoriteMemory}` : ''}
${data.secretThings ? `Things only they know: ${data.secretThings}` : ''}
${data.specialMoments ? `Special moments: ${data.specialMoments}` : ''}
${data.futureDreamsTogether ? `Future dreams: ${data.futureDreamsTogether}` : ''}
${data.funnyMemory ? `Funny memory: ${data.funnyMemory}` : ''}
${data.promises ? `Promises: ${data.promises}` : ''}
${data.extraDetails ? `Extra: ${data.extraDetails}` : ''}

WRITING STYLE: ${styleGuide}
LENGTH: ${lengthGuide}
LANGUAGE: ${data.language || 'English'}
PHOTOS: ${numPhotos}

Return ONLY valid JSON, no markdown, no explanation:
{
  "title": "cinematic poetic title personal to their story",
  "intro": "2-3 sentence cinematic opening like a romantic film",
  "letter": "complete love letter in chosen style and language",
  "galleryTitle": "poetic gallery title",
  "gallerySubtitle": "short romantic gallery subtitle",
  "photoCaptions": ${numPhotos > 0 ? `["caption 1", "caption 2" ... exactly ${numPhotos} captions]` : '[]'},
  "endingTitle": "powerful emotional ending title",
  "endingMessage": "3-4 sentence closing message",
  "quote": "short powerful quote from the letter",
  "signature": "warm sign-off from ${data.senderName}",
  "cta": "warm invitation to create their own experience on Cymor Love Hub"
}`,
    numPhotos
  };
}

async function tryModel(modelName, prompt) {
  const model = genAI.getGenerativeModel({ model: modelName });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function generateExperience(data) {
  const { prompt, numPhotos } = buildPrompt(data);
  let lastError = null;

  for (const modelName of MODEL_CHAIN) {
    try {
      logger.info(`Trying Gemini model: ${modelName}`);
      const text = await tryModel(modelName, prompt);
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);

      // Ensure photoCaptions length matches
      if (numPhotos > 0) {
        const caps = parsed.photoCaptions || [];
        while (caps.length < numPhotos) caps.push('A beautiful moment, forever remembered.');
        parsed.photoCaptions = caps.slice(0, numPhotos);
      } else {
        parsed.photoCaptions = [];
      }

      logger.info(`Success with model: ${modelName}`);
      return parsed;

    } catch (err) {
      const msg = err.message || '';
      const isRetryable = msg.includes('503') || msg.includes('429') || msg.includes('overloaded') || msg.includes('unavailable');

      logger.warn(`Model ${modelName} failed: ${msg.substring(0, 120)}`);
      lastError = err;

      if (isRetryable) {
        // Small wait before trying next model
        await new Promise(r => setTimeout(r, 2000));
        continue;
      }

      // Non-retryable error (404, auth, bad JSON) — still try next model
      continue;
    }
  }

  // All models failed
  logger.error('All Gemini models failed. Last error:', lastError?.message);
  throw new Error('Our AI is experiencing high demand right now. Please try again in a minute.');
}

module.exports = { generateExperience };
