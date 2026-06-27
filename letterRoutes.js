const express = require('express');
const router = express.Router();
const { upload } = require('../utils/cloudinary');
const { generateLetter, getLetter, reactToLetter } = require('../controllers/letterController');
const { generateLimiter } = require('../middleware/rateLimiter');

const uploadFields = upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'music', maxCount: 1 }
]);

router.post('/generate', generateLimiter, uploadFields, generateLetter);
router.get('/:id', getLetter);
router.post('/:id/react', reactToLetter);

module.exports = router;
