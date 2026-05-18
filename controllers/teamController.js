// ============================================
// Team Controller
// ============================================
const Team = require('../models/Team');
const User = require('../models/User');
const Activity = require('../models/Activity');

const teamController = {
    getAll: async (req, res) => {
        try {
            const teams = await Team.findByUser(req.user.id);
            res.json(teams);
        } catch (error) { res.status(500).json({ error: 'Failed to fetch teams' }); }
    },

    create: async (req, res) => {
        try {
            const team = await Team.create({ ...req.body, created_by: req.user.id });
            await Activity.create({ action: 'created team', entity_type: 'team', entity_id: team.id, user_id: req.user.id });
            res.status(201).json(team);
        } catch (error) { res.status(500).json({ error: 'Failed to create team' }); }
    },

    getMembers: async (req, res) => {
        try {
            const members = await Team.getMembers(req.params.id);
            res.json(members);
        } catch (error) { res.status(500).json({ error: 'Failed to fetch members' }); }
    },

    addMember: async (req, res) => {
        try {
            const { user_id, role } = req.body;
            await Team.addMember(req.params.id, user_id, role);
            await Activity.create({ action: 'added member to team', entity_type: 'team', entity_id: parseInt(req.params.id), user_id: req.user.id });
            res.json({ message: 'Member added' });
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'User already in team' });
            res.status(500).json({ error: 'Failed to add member' });
        }
    },

    removeMember: async (req, res) => {
        try {
            await Team.removeMember(req.params.id, req.params.userId);
            res.json({ message: 'Member removed' });
        } catch (error) { res.status(500).json({ error: 'Failed to remove member' }); }
    },

    getAllUsers: async (req, res) => {
        try {
            const users = await User.findAll();
            res.json(users);
        } catch (error) { res.status(500).json({ error: 'Failed to fetch users' }); }
    }
};

module.exports = teamController;
