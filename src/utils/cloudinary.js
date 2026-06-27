const cloudinary = require('cloudinary').v2;
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
    const isAudio =
      file.mimetype.startsWith('audio/') ||
      file.mimetype === 'video/mp4' ||
      file.mimetype === 'video/ogg' ||
      /\.(mp3|wav|m4a|ogg|oga|opus|aac|flac)$/i.test(file.originalname);

    return {
      folder: 'cymor-love-hub',
      resource_type: isAudio ? 'video' : 'image',
      // 'video' resource_type handles all audio in Cloudinary
      allowed_formats: isAudio
        ? ['mp3', 'wav', 'm4a', 'mp4', 'ogg', 'oga', 'opus', 'aac', 'flac']
        : ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      transformation: isAudio ? [] : [{ quality: 'auto', fetch_format: 'auto' }]
    };
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const isImage = file.mimetype.startsWith('image/');
    const isAudio =
      file.mimetype.startsWith('audio/') ||
      file.mimetype.startsWith('video/') ||
      /\.(mp3|wav|m4a|ogg|oga|opus|aac|flac)$/i.test(file.originalname);

    if (isImage || isAudio) cb(null, true);
    else cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
  }
});

module.exports = { cloudinary, upload };
