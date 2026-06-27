const mongoose = require('mongoose');

const letterSchema = new mongoose.Schema({
  shareId: { type: String, required: true, unique: true, index: true },

  // Sender & recipient
  senderName: { type: String, required: true, trim: true },
  recipientName: { type: String, required: true, trim: true },
  occasion: { type: String, default: 'Love Letter' },
  relationshipDuration: String,
  nickname: String,
  favoritePlace: String,
  futureDream: String,
  firstDate: String,

  // Story inputs
  howMet: String,
  loveMost: String,
  favoriteMemory: String,
  secretThings: String,
  specialMoments: String,
  futureDreamsTogether: String,
  funnyMemory: String,
  promises: String,
  extraDetails: String,

  // AI settings
  writingStyle: { type: String, default: 'Romantic' },
  letterLength: { type: String, default: 'Long' },
  language: { type: String, default: 'English' },
  theme: { type: String, default: 'Rose Garden' },

  // Media
  images: [{ url: String, publicId: String }],
  musicType: { type: String, default: 'built-in' },
  musicTrack: { type: String, default: 'soft-piano' },
  musicUrl: String,

  // AI generated content
  aiContent: {
    title: String,
    intro: String,
    letter: String,
    galleryTitle: String,
    gallerySubtitle: String,
    photoCaptions: [String],
    endingTitle: String,
    endingMessage: String,
    quote: String,
    signature: String,
    cta: String
  },

  // Meta
  views: { type: Number, default: 0 },
  reactions: { type: Map, of: Number, default: {} },
  isPasswordProtected: { type: Boolean, default: false },
  passwordHash: String,
  expiresAt: { type: Date, default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) }
}, { timestamps: true });

letterSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Letter', letterSchema);
