require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const mongoose = require('mongoose');
const { logger } = require('./src/utils/logger');
const letterRoutes = require('./src/routes/letterRoutes');
const { generalLimiter } = require('./src/middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 3000;

// Security & performance
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api', generalLimiter);

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/letters', letterRoutes);

// Page routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/create', (req, res) => res.sendFile(path.join(__dirname, 'public', 'create.html')));
app.get('/l/:id', (req, res) => res.sendFile(path.join(__dirname, 'public', 'experience.html')));

// Connect DB then start
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    logger.info('MongoDB connected');
    app.listen(PORT, () => logger.info(`Cymor Love Hub running on port ${PORT}`));
  })
  .catch(err => {
    logger.error('DB connection failed:', err);
    process.exit(1);
  });

module.exports = app;
