const { GoogleGenerativeAI } = require('@google/generative-ai');
const { logger } = require('../utils/logger');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

async function generateExperience(data) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const styleGuide = STYLE_GUIDES[data.writingStyle] || STYLE_GUIDES.Romantic;
  const lengthGuide = LENGTH_GUIDES[data.letterLength] || LENGTH_GUIDES.Long;
  const numPhotos = data.images?.length || 0;

  const prompt = `You are a master romantic storyteller and screenwriter creating a deeply personal cinematic love experience.

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
${data.futureDreamsTogether ? `Future dreams together: ${data.futureDreamsTogether}` : ''}
${data.funnyMemory ? `Funny memory: ${data.funnyMemory}` : ''}
${data.promises ? `Promises: ${data.promises}` : ''}
${data.extraDetails ? `Extra: ${data.extraDetails}` : ''}

WRITING STYLE: ${styleGuide}
LENGTH: ${lengthGuide}
LANGUAGE: ${data.language || 'English'}
NUMBER OF PHOTOS: ${numPhotos} (generate exactly ${numPhotos} photo captions if photos exist, otherwise empty array)

Generate a complete cinematic romantic experience. Return ONLY valid JSON, no markdown, no explanation.

{
  "title": "A cinematic, poetic title for this love story (not generic, deeply personal to their story)",
  "intro": "A beautiful 2-3 sentence cinematic introduction that appears before the letter. Should feel like the opening of a romantic film.",
  "letter": "The complete love letter in the chosen style and language. Rich, emotional, specific to their story. No generic lines.",
  "galleryTitle": "A poetic title for their photo gallery section",
  "gallerySubtitle": "A short romantic subtitle for the gallery",
  "photoCaptions": ["Caption for photo 1 that feels personal and cinematic", "Caption for photo 2", ...],
  "endingTitle": "A powerful, emotional ending title",
  "endingMessage": "A beautiful 3-4 sentence closing message that ties everything together emotionally",
  "quote": "A short, powerful romantic quote or line from the letter that could stand alone as art",
  "signature": "A warm, personal sign-off from ${data.senderName} to ${data.recipientName}",
  "cta": "A warm invitation line encouraging the recipient to create their own experience on Cymor Love Hub"
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    // Ensure photoCaptions matches image count
    if (numPhotos > 0 && (!parsed.photoCaptions || parsed.photoCaptions.length < numPhotos)) {
      const existing = parsed.photoCaptions || [];
      while (existing.length < numPhotos) existing.push('A moment frozen in time, beautiful and forever.');
      parsed.photoCaptions = existing;
    } else if (numPhotos === 0) {
      parsed.photoCaptions = [];
    }

    return parsed;
  } catch (err) {
    logger.error('Gemini generation error:', err);
    throw new Error('AI generation failed. Please try again.');
  }
}

module.exports = { generateExperience };
