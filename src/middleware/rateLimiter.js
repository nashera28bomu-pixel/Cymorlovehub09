const rateLimit = require('express-rate-limit');
const generalLimiter = rateLimit({ windowMs: 15*60*1000, max: 100, message: { error: 'Too many requests.' } });
const generateLimiter = rateLimit({ windowMs: 60*60*1000, max: 15, message: { error: 'Generation limit reached. Try again in an hour.' } });
module.exports = { generalLimiter, generateLimiter };
