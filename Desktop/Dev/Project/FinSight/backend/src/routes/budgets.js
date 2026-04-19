const router = require('express').Router();
const protect = require('../middleware/auth');
const { create, getAll } = require('../controllers/budgetController');

router.use(protect);
router.post('/', create);
router.get('/', getAll);

module.exports = router;
