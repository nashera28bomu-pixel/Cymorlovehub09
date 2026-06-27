const cloudinary = require('cloudinary').v2;
// cloudinary v1 - compatible with multer-storage-cloudinary@4
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isAudio = file.mimetype.startsWith('audio/') || file.mimetype === 'video/mp4';
    return {
      folder: 'cymor-love-hub',
      resource_type: isAudio ? 'video' : 'image',
      allowed_formats: isAudio ? ['mp3', 'wav', 'm4a', 'mp4'] : ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      transformation: isAudio ? [] : [{ quality: 'auto', fetch_format: 'auto' }]
    };
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    // Accept all image and audio types including .m4a (audio/x-m4a, audio/mp4, video/mp4)
    const isImage = file.mimetype.startsWith('image/');
    const isAudio = file.mimetype.startsWith('audio/') || file.mimetype === 'video/mp4';
    if (isImage || isAudio) cb(null, true);
    else cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
  }
});

module.exports = { cloudinary, upload };
