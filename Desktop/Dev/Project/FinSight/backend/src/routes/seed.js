const router = require('express').Router();
const protect = require('../middleware/auth');
const { seed } = require('../services/seedService');

router.post('/', protect, async (req, res, next) => {
  try {
    await seed(req.userId);
    res.json({ message: 'Demo data loaded.' });
  } catch (err) { next(err); }
});

module.exports = router;
