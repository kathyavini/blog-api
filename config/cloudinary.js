const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'blog-api',
  },
});

const imageFilter = (req, file, cb) => {
  const validTypes = ['image/gif', 'image/jpeg', 'image/png'];
  if (validTypes.includes(file.mimetype)) {
    // accept this file
    cb(null, true);
  } else {
    // reject this file
    cb(null, false);
  }
};

const upload = multer({ storage: storage, fileFilter: imageFilter });

const cloudinaryDelete = (fileId) => {
  cloudinary.uploader.destroy(fileId).then((result) => {
    console.log(result);
  });
};

module.exports = { upload, cloudinary, cloudinaryDelete };
