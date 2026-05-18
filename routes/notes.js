// Note Routes
const router = require('express').Router();
const noteController = require('../controllers/noteController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

router.get('/', auth, noteController.getAll);
router.post('/', auth, validate.note, noteController.create);
router.put('/:id', auth, noteController.update);
router.delete('/:id', auth, noteController.delete);
router.patch('/:id/pin', auth, noteController.togglePin);

module.exports = router;
