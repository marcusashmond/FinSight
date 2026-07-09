const router = require('express').Router();
const protect = require('../middleware/auth');
const { getAll, create, remove, sync } = require('../controllers/subscriptionController');

router.use(protect);
router.get('/', getAll);
router.post('/', create);
router.post('/sync', sync);
router.delete('/:id', remove);

module.exports = router;
