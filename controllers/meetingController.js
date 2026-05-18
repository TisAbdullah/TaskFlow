// ============================================
// Meeting Controller
// ============================================
const Meeting = require('../models/Meeting');
const Activity = require('../models/Activity');

const meetingController = {
    getAll: async (req, res) => {
        try {
            const meetings = await Meeting.findByUser(req.user.id);
            res.json(meetings);
        } catch (error) { res.status(500).json({ error: 'Failed to fetch meetings' }); }
    },

    create: async (req, res) => {
        try {
            const meeting = await Meeting.create({ ...req.body, created_by: req.user.id });
            await Activity.create({ action: 'scheduled meeting', entity_type: 'meeting', entity_id: meeting.id, user_id: req.user.id });
            res.status(201).json(meeting);
        } catch (error) { res.status(500).json({ error: 'Failed to create meeting' }); }
    },

    update: async (req, res) => {
        try {
            const meeting = await Meeting.update(req.params.id, req.body);
            res.json(meeting);
        } catch (error) { res.status(500).json({ error: 'Failed to update meeting' }); }
    },

    delete: async (req, res) => {
        try {
            await Meeting.delete(req.params.id);
            res.json({ message: 'Meeting deleted' });
        } catch (error) { res.status(500).json({ error: 'Failed to delete meeting' }); }
    }
};

module.exports = meetingController;
