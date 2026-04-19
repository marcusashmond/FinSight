const router = require('express').Router();
const protect = require('../middleware/auth');
const { create, getAll, remove } = require('../controllers/budgetController');

router.use(protect);
router.post('/', create);
router.get('/', getAll);
router.delete('/:id', remove);

module.exports = router;
