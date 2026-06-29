const router = require('express').Router();
const protect = require('../middleware/auth');
const { summary, categories, trends, insights, daily } = require('../controllers/analyticsController');

router.use(protect);
router.get('/summary', summary);
router.get('/categories', categories);
router.get('/trends', trends);
router.get('/insights', insights);
router.get('/daily', daily);

module.exports = router;
