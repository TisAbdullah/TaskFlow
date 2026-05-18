// Task Routes
const router = require('express').Router();
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

router.get('/', auth, taskController.getAll);
router.post('/', auth, validate.task, taskController.create);
router.put('/:id', auth, taskController.update);
router.delete('/:id', auth, taskController.delete);
router.patch('/:id/status', auth, taskController.updateStatus);
router.get('/export/:format', auth, taskController.export);

module.exports = router;
