const express = require('express');
const router = express.Router();
const { upload } = require('../utils/cloudinary');
const { generate, getExperience, react } = require('../controllers/experienceController');
const { generateLimiter } = require('../middleware/rateLimiter');

const uploadFields = upload.fields([{ name: 'images', maxCount: 10 }, { name: 'music', maxCount: 1 }]);

router.post('/generate/:type', generateLimiter, uploadFields, generate);
router.get('/:id', getExperience);
router.post('/:id/react', react);

module.exports = router;
