const router = require('express').Router();
const multer = require('multer');
const protect = require('../middleware/auth');
const { upload } = require('../controllers/uploadController');

const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) cb(null, true);
  else cb(new Error('Only CSV files are allowed'), false);
};
const uploader = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/', protect, uploader.single('file'), upload);

module.exports = router;
