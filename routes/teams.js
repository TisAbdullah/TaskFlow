// Team Routes
const router = require('express').Router();
const teamController = require('../controllers/teamController');
const auth = require('../middleware/auth');

router.get('/', auth, teamController.getAll);
router.post('/', auth, teamController.create);
router.get('/users', auth, teamController.getAllUsers);
router.get('/:id/members', auth, teamController.getMembers);
router.post('/:id/members', auth, teamController.addMember);
router.delete('/:id/members/:userId', auth, teamController.removeMember);

module.exports = router;
