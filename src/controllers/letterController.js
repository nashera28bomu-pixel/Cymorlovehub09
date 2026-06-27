const { nanoid } = require('nanoid');
const Letter = require('../models/Letter');
const { generateExperience } = require('../services/geminiService');
const { logger } = require('../utils/logger');

// POST /api/letters/generate
async function generateLetter(req, res) {
  try {
    const body = req.body;

    // Parse images from uploaded files
    const images = (req.files?.images || []).map(f => ({
      url: f.path,
      publicId: f.filename
    }));

    // Parse music
    let musicUrl = null;
    if (req.files?.music && req.files.music[0]) {
      musicUrl = req.files.music[0].path;
    }

    const data = { ...body, images };

    // Generate AI content
    const aiContent = await generateExperience(data);

    // Save to DB
    const shareId = nanoid(7).toUpperCase();

    const letter = new Letter({
      shareId,
      senderName: body.senderName,
      recipientName: body.recipientName,
      occasion: body.occasion,
      relationshipDuration: body.relationshipDuration,
      nickname: body.nickname,
      favoritePlace: body.favoritePlace,
      futureDream: body.futureDream,
      firstDate: body.firstDate,
      howMet: body.howMet,
      loveMost: body.loveMost,
      favoriteMemory: body.favoriteMemory,
      secretThings: body.secretThings,
      specialMoments: body.specialMoments,
      futureDreamsTogether: body.futureDreamsTogether,
      funnyMemory: body.funnyMemory,
      promises: body.promises,
      extraDetails: body.extraDetails,
      writingStyle: body.writingStyle || 'Romantic',
      letterLength: body.letterLength || 'Long',
      language: body.language || 'English',
      theme: body.theme || 'Rose Garden',
      images,
      musicType: body.musicType || 'built-in',
      musicTrack: body.musicTrack || 'soft-piano',
      musicUrl,
      aiContent
    });

    await letter.save();

    const shareUrl = `${req.protocol}://${req.get('host')}/l/${shareId}`;

    res.json({ success: true, shareId, shareUrl });
  } catch (err) {
    logger.error('generateLetter error:', err);
    res.status(500).json({ error: err.message || 'Generation failed.' });
  }
}

// GET /api/letters/:id
async function getLetter(req, res) {
  try {
    const letter = await Letter.findOne({ shareId: req.params.id });
    if (!letter) return res.status(404).json({ error: 'Experience not found.' });

    // Increment views
    letter.views += 1;
    await letter.save();

    res.json({ success: true, letter });
  } catch (err) {
    logger.error('getLetter error:', err);
    res.status(500).json({ error: 'Failed to load experience.' });
  }
}

// POST /api/letters/:id/react
async function reactToLetter(req, res) {
  try {
    const { emoji } = req.body;
    if (!emoji) return res.status(400).json({ error: 'Emoji required.' });

    const letter = await Letter.findOne({ shareId: req.params.id });
    if (!letter) return res.status(404).json({ error: 'Not found.' });

    const current = letter.reactions.get(emoji) || 0;
    letter.reactions.set(emoji, current + 1);
    await letter.save();

    res.json({ success: true, reactions: Object.fromEntries(letter.reactions) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to react.' });
  }
}

module.exports = { generateLetter, getLetter, reactToLetter };
