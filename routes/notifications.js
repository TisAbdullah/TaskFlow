// Notification Routes
const router = require('express').Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

router.get('/', auth, notificationController.getAll);
router.patch('/:id/read', auth, notificationController.markRead);
router.patch('/read-all', auth, notificationController.markAllRead);

module.exports = router;
