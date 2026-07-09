const uploadService = require('../services/uploadService');

const upload = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file provided' });
    const inserted = await uploadService.processUpload(req.userId, req.file.buffer);
    res.status(201).json({ inserted: inserted.length, transactions: inserted });
  } catch (err) { next(err); }
};

module.exports = { upload };
