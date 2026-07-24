require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const mongoose = require('mongoose');
const { logger } = require('./src/utils/logger');
const experienceRoutes = require('./src/routes/experienceRoutes');
const { generateCoupleName } = require('./src/controllers/coupleNameController');
const { generalLimiter, generateLimiter } = require('./src/middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api', generalLimiter);
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/experiences', experienceRoutes);
app.post('/api/couplename', generateLimiter, generateCoupleName);

// Page routes
const pub = f => (req, res) => res.sendFile(path.join(__dirname, 'public', f));
const page = f => (req, res) => res.sendFile(path.join(__dirname, 'public', 'pages', f));

app.get('/', pub('index.html'));
app.get('/create', page('create.html'));
app.get('/poem', page('poem.html'));
app.get('/apology', page('apology.html'));
app.get('/timeline', page('timeline.html'));
app.get('/proposal', page('proposal.html'));
app.get('/quiz', page('quiz.html'));
app.get('/playlist', page('playlist.html'));
app.get('/couplename', page('couplename.html'));
app.get('/experience/:id', page('experience.html'));

// Backwards compat with old /l/:id links
app.get('/l/:id', (req, res) => res.redirect(`/experience/${req.params.id}`));

// Global JSON error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err.message);
  if (req.path.startsWith('/api')) return res.status(500).json({ error: err.message || 'Something went wrong.' });
  res.status(500).send('Server error');
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => { logger.info('MongoDB connected'); app.listen(PORT, () => logger.info(`Cymor Love Hub v2 on port ${PORT}`)); })
  .catch(err => { logger.error('DB failed:', err); process.exit(1); });
