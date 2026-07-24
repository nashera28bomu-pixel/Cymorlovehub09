const { nanoid } = require('nanoid');
const Experience = require('../models/Experience');
const gemini = require('../services/geminiService');
const { logger } = require('../utils/logger');

const GENERATORS = {
  letter: gemini.generateLetter,
  poem: gemini.generatePoem,
  apology: gemini.generateApology,
  timeline: gemini.generateTimeline,
  proposal: gemini.generateProposal,
  quiz: gemini.generateLoveLanguageResult,
  playlist: gemini.generatePlaylist
};

async function generate(req, res) {
  try {
    const { type } = req.params;
    if (!GENERATORS[type]) return res.status(400).json({ error: 'Unknown experience type.' });

    const body = req.body;
    const images = (req.files?.images || []).map(f => ({ url: f.path, publicId: f.filename }));
    let musicUrl = req.files?.music?.[0]?.path || null;

    const data = { ...body, images };
    const aiContent = await GENERATORS[type](data);
    const shareId = nanoid(7).toUpperCase();

    const exp = new Experience({
      shareId, type,
      senderName: body.senderName || 'Someone Special',
      recipientName: body.recipientName || 'You',
      theme: body.theme || 'Rose Garden',
      language: body.language || 'English',
      inputData: body, aiContent, images,
      musicType: body.musicType || 'built-in',
      musicTrack: body.musicTrack || 'soft-piano',
      musicUrl
    });
    await exp.save();

    res.json({ success: true, shareId, shareUrl: `${req.protocol}://${req.get('host')}/experience/${shareId}` });
  } catch (err) {
    logger.error('generate error:', err);
    res.status(500).json({ error: err.message || 'Generation failed.' });
  }
}

async function getExperience(req, res) {
  try {
    const exp = await Experience.findOne({ shareId: req.params.id });
    if (!exp) return res.status(404).json({ error: 'Experience not found or expired.' });
    exp.views += 1;
    await exp.save();
    res.json({ success: true, experience: exp });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load experience.' });
  }
}

async function react(req, res) {
  try {
    const { emoji } = req.body;
    const exp = await Experience.findOne({ shareId: req.params.id });
    if (!exp) return res.status(404).json({ error: 'Not found.' });
    exp.reactions.set(emoji, (exp.reactions.get(emoji) || 0) + 1);
    await exp.save();
    res.json({ success: true, reactions: Object.fromEntries(exp.reactions) });
  } catch (err) {
    res.status(500).json({ error: 'Failed.' });
  }
}

module.exports = { generate, getExperience, react };
