const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directories exist
const uploadsDir = path.join(__dirname, '../uploads');
const subjectsDir = path.join(uploadsDir, 'subjects');

if (!fs.existsSync(subjectsDir)) {
  fs.mkdirSync(subjectsDir, { recursive: true });
}

console.log('Subjects upload directory:', subjectsDir);

// Configure multer for subject cover images
const subjectStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('Multer destination called for file:', file.originalname);
    cb(null, subjectsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const finalName = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
    console.log('Multer filename generated:', finalName);
    cb(null, finalName);
  }
});

const subjectUpload = multer({
  storage: subjectStorage,
  fileFilter: (req, file, cb) => {
    console.log('File filter called for:', file.originalname, 'mime:', file.mimetype);
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      console.error('File rejected - invalid mime type');
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

module.exports = {
  subjectUpload
};
