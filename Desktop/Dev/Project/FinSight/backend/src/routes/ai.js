const router = require('express').Router();
const protect = require('../middleware/auth');
const { getInsights } = require('../services/aiService');

router.post('/insights', protect, async (req, res, next) => {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(503).json({ message: 'AI insights not configured.' });
    }
    const result = await getInsights(req.userId);
    res.json(result);
  } catch (err) { next(err); }
});

module.exports = router;
