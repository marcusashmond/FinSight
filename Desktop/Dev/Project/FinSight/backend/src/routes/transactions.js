const router = require('express').Router();
const protect = require('../middleware/auth');
const { create, getAll, getById, remove } = require('../controllers/transactionController');

router.use(protect);
router.post('/', create);
router.get('/', getAll);
router.get('/:id', getById);
router.delete('/:id', remove);

module.exports = router;
