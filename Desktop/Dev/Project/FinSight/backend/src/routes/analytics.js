const router = require('express').Router();
const protect = require('../middleware/auth');
const { summary, categories, trends } = require('../controllers/analyticsController');

router.use(protect);
router.get('/summary', summary);
router.get('/categories', categories);
router.get('/trends', trends);

module.exports = router;
