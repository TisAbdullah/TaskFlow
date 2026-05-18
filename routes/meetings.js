// Meeting Routes
const router = require('express').Router();
const meetingController = require('../controllers/meetingController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

router.get('/', auth, meetingController.getAll);
router.post('/', auth, validate.meeting, meetingController.create);
router.put('/:id', auth, meetingController.update);
router.delete('/:id', auth, meetingController.delete);

module.exports = router;
