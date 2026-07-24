const { GoogleGenerativeAI } = require('@google/generative-ai');
const { logger } = require('../utils/logger');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL_CHAIN = ['gemini-2.5-flash-lite','gemini-2.0-flash','gemini-2.0-flash-lite','gemini-1.5-flash-8b'];

async function callGemini(prompt) {
  let lastError;
  for (const modelName of MODEL_CHAIN) {
    try {
      logger.info(`Trying model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const clean = text.replace(/```json|```/g, '').trim();
      return JSON.parse(clean);
    } catch (err) {
      logger.warn(`Model ${modelName} failed: ${err.message?.substring(0,100)}`);
      lastError = err;
      if (err.message?.includes('503') || err.message?.includes('429')) await new Promise(r => setTimeout(r, 2000));
    }
  }
  throw new Error('AI is experiencing high demand. Please try again in a moment.');
}

// ── LOVE LETTER ─────────────────────────
async function generateLetter(data) {
  const numPhotos = data.images?.length || 0;
  const styleGuides = {
    Romantic:'deeply romantic, heartfelt, passionate',Poetic:'lyrical, metaphor-rich, poetic',
    'Deep Emotional':'profoundly emotional, vulnerable, raw','Funny':'warm, witty, playful with loving humor',
    Cute:'adorable, sweet, lighthearted',Elegant:'sophisticated, refined, classic',
    Proposal:'culminating in a heartfelt marriage proposal',Anniversary:'celebrating shared history and enduring love',
    Apology:'sincere, remorseful, healing, full of hope','Long Distance':'aching with longing, hopeful'
  };
  const lengthGuides = { Short:'200-300 words', Medium:'400-600 words', Long:'700-1000 words', 'Very Long':'1200-1800 words' };

  const prompt = `You are a master romantic storyteller. Create a deeply personal cinematic love experience.
RECIPIENT: ${data.recipientName} | SENDER: ${data.senderName}
${data.nickname?`NICKNAME: ${data.nickname}`:''}
OCCASION: ${data.occasion||'Love Letter'} | TOGETHER: ${data.relationshipDuration||''}
FAVORITE PLACE: ${data.favoritePlace||''} | FIRST DATE: ${data.firstDate||''}
HOW MET: ${data.howMet||''} | LOVE MOST: ${data.loveMost||''}
FAVORITE MEMORY: ${data.favoriteMemory||''} | SECRET THINGS: ${data.secretThings||''}
SPECIAL MOMENTS: ${data.specialMoments||''} | FUTURE DREAMS: ${data.futureDreamsTogether||''}
FUNNY MEMORY: ${data.funnyMemory||''} | PROMISES: ${data.promises||''}
EXTRA: ${data.extraDetails||''}
STYLE: ${styleGuides[data.writingStyle]||styleGuides.Romantic}
LENGTH: ${lengthGuides[data.letterLength]||lengthGuides.Long}
LANGUAGE: ${data.language||'English'}
PHOTOS: ${numPhotos}
Return ONLY valid JSON:
{"title":"cinematic poetic title personal to their story","intro":"2-3 sentence cinematic opening like a romantic film","letter":"complete love letter","galleryTitle":"poetic gallery title","gallerySubtitle":"short romantic subtitle","photoCaptions":${numPhotos>0?`["exactly ${numPhotos} personal captions"]`:'[]'},"endingTitle":"powerful emotional ending title","endingMessage":"3-4 sentence closing message","quote":"short powerful standalone quote","signature":"warm sign-off from ${data.senderName}","cta":"warm invitation to create their own on Cymor Love Hub"}`;

  const parsed = await callGemini(prompt);
  if (numPhotos > 0) {
    const caps = parsed.photoCaptions || [];
    while (caps.length < numPhotos) caps.push('A beautiful moment, forever remembered.');
    parsed.photoCaptions = caps.slice(0, numPhotos);
  } else { parsed.photoCaptions = []; }
  return parsed;
}

// ── LOVE POEM ───────────────────────────
async function generatePoem(data) {
  const prompt = `You are a master poet. Write a deeply personal love poem.
FOR: ${data.recipientName} | FROM: ${data.senderName}
THEIR STORY: ${data.story||''}
MOOD: ${data.mood||'Romantic'} | STYLE: ${data.rhymeStyle||'Free verse'}
LANGUAGE: ${data.language||'English'}
Return ONLY valid JSON:
{"title":"beautiful poem title","poem":"the complete poem with line breaks as \\n","dedication":"a short personal dedication line","quote":"one most powerful line from the poem","endingMessage":"a warm 2 sentence closing from sender"}`;
  return callGemini(prompt);
}

// ── APOLOGY EXPERIENCE ──────────────────
async function generateApology(data) {
  const prompt = `You are a compassionate emotional writer. Craft a sincere, healing apology experience.
FROM: ${data.senderName} | TO: ${data.recipientName}
WHAT HAPPENED: ${data.whatHappened||''}
FEELINGS: ${data.feelings||''} | PROMISES: ${data.promises||''}
HOW LONG TOGETHER: ${data.duration||''} | LANGUAGE: ${data.language||'English'}
Return ONLY valid JSON:
{"title":"gentle healing title","opening":"a soft 2 sentence cinematic opening","apology":"the sincere heartfelt apology message","acknowledgment":"specific acknowledgment of what went wrong without excuses","promise":"specific promises going forward","closing":"a hopeful warm closing","quote":"one line that captures the sincerity","signature":"warm sign-off from ${data.senderName}"}`;
  return callGemini(prompt);
}

// ── ANNIVERSARY TIMELINE ────────────────
async function generateTimeline(data) {
  const milestonesJson = JSON.stringify(data.milestones || []);
  const prompt = `You are a romantic storyteller. Create a cinematic anniversary timeline narrative.
COUPLE: ${data.senderName} & ${data.recipientName}
TOGETHER SINCE: ${data.startDate||''} | YEARS: ${data.years||''}
MILESTONES: ${milestonesJson}
LANGUAGE: ${data.language||'English'}
Return ONLY valid JSON:
{"title":"cinematic title for their love story","intro":"3 sentence romantic opening narration","milestoneNarratives":["narrative for each milestone matching the input array order — same count"],"closingTitle":"powerful closing chapter title","closingMessage":"3-4 sentence beautiful closing","quote":"one timeless quote about their journey","signature":"warm closing from ${data.senderName}"}`;
  return callGemini(prompt);
}

// ── PROPOSAL PLANNER ────────────────────
async function generateProposal(data) {
  const prompt = `You are a romantic proposal specialist. Plan and write the perfect proposal experience.
PROPOSER: ${data.senderName} | PARTNER: ${data.recipientName}
HOW MET: ${data.howMet||''} | FAVORITE PLACE: ${data.favoritePlace||''}
WHAT YOU LOVE: ${data.loveMost||''} | SHARED DREAMS: ${data.futureDreams||''}
RING READY: ${data.ringReady||'yes'} | LANGUAGE: ${data.language||'English'}
Return ONLY valid JSON:
{"title":"cinematic proposal title","settingSuggestion":"detailed romantic setting suggestion based on their story","speech":"the complete heartfelt proposal speech word for word","moment":"how to set up and execute the moment step by step","afterYes":"beautiful message to share after she says yes","quote":"one line from the speech that stands alone as art","signature":"from ${data.senderName} with all my love"}`;
  return callGemini(prompt);
}

// ── LOVE LANGUAGE QUIZ RESULTS ──────────
async function generateLoveLanguageResult(data) {
  const prompt = `You are a relationship coach expert in love languages. Analyze these quiz answers.
PERSON 1: ${data.name1} | PERSON 2: ${data.name2}
PERSON 1 ANSWERS: ${JSON.stringify(data.answers1)}
PERSON 2 ANSWERS: ${JSON.stringify(data.answers2)}
Return ONLY valid JSON:
{"person1":{"name":"${data.name1}","primaryLanguage":"their primary love language","secondaryLanguage":"secondary","description":"2 sentence description of how they give and receive love","tips":["3 specific tips for their partner to love them well"]},"person2":{"name":"${data.name2}","primaryLanguage":"their primary love language","secondaryLanguage":"secondary","description":"2 sentence description","tips":["3 specific tips"]},"compatibility":"2 sentence honest compatibility insight","dailyTip":"one beautiful daily practice for this specific couple","quote":"a meaningful quote about their unique combination"}`;
  return callGemini(prompt);
}

// ── DAILY LOVE NOTE ─────────────────────
async function generateDailyNote(data) {
  const prompt = `You are a romantic writer. Generate a short warm morning love note.
FROM: ${data.senderName} | TO: ${data.recipientName}
DAY NUMBER: ${data.dayNumber||1} of ${data.totalDays||30}
THEIR STORY CONTEXT: ${data.context||''}
LANGUAGE: ${data.language||'English'}
Return ONLY valid JSON:
{"subject":"warm morning subject line","note":"a short 3-5 sentence morning love note, fresh and specific","quote":"one short sweet quote","signature":"from ${data.senderName}"}`;
  return callGemini(prompt);
}

// ── PLAYLIST BUILDER ────────────────────
async function generatePlaylist(data) {
  const prompt = `You are a music curator who specializes in romantic playlists. Create a deeply personal playlist concept.
FOR: ${data.recipientName} | FROM: ${data.senderName}
RELATIONSHIP VIBE: ${data.vibe||''} | GENRES THEY LIKE: ${data.genres||''}
SPECIAL SONG: ${data.specialSong||''} | MOOD: ${data.mood||'Romantic'}
LANGUAGE: ${data.language||'English'}
Return ONLY valid JSON:
{"title":"creative playlist name personal to their story","description":"2 sentence description of the playlist's emotional journey","tracks":[{"number":1,"title":"Song Title","artist":"Artist Name","why":"one sentence why this song fits their story"},{"number":2,"title":"Song Title","artist":"Artist Name","why":"reason"},{"number":3,"title":"Song Title","artist":"Artist Name","why":"reason"},{"number":4,"title":"Song Title","artist":"Artist Name","why":"reason"},{"number":5,"title":"Song Title","artist":"Artist Name","why":"reason"},{"number":6,"title":"Song Title","artist":"Artist Name","why":"reason"},{"number":7,"title":"Song Title","artist":"Artist Name","why":"reason"},{"number":8,"title":"Song Title","artist":"Artist Name","why":"reason"}],"closingNote":"a warm personal note about what music means to their love story","quote":"one line about music and love"}`;
  return callGemini(prompt);
}

module.exports = { generateLetter, generatePoem, generateApology, generateTimeline, generateProposal, generateLoveLanguageResult, generateDailyNote, generatePlaylist };
