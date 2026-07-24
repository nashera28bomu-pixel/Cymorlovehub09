const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  shareId: { type: String, required: true, unique: true, index: true },
  type: { type: String, enum: ['letter','poem','apology','timeline','proposal','quiz','playlist'], required: true },
  senderName: { type: String, required: true },
  recipientName: { type: String, required: true },
  theme: { type: String, default: 'Rose Garden' },
  language: { type: String, default: 'English' },
  inputData: { type: mongoose.Schema.Types.Mixed },
  aiContent: { type: mongoose.Schema.Types.Mixed },
  images: [{ url: String, publicId: String }],
  musicType: { type: String, default: 'built-in' },
  musicTrack: { type: String, default: 'soft-piano' },
  musicUrl: String,
  views: { type: Number, default: 0 },
  reactions: { type: Map, of: Number, default: {} },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 90*24*60*60*1000) }
}, { timestamps: true });

experienceSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
module.exports = mongoose.model('Experience', experienceSchema);
