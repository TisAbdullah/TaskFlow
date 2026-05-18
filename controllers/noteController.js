// ============================================
// Note Controller
// ============================================
const Note = require('../models/Note');
const Activity = require('../models/Activity');

const noteController = {
    getAll: async (req, res) => {
        try {
            const notes = await Note.findByUser(req.user.id);
            res.json(notes);
        } catch (error) { res.status(500).json({ error: 'Failed to fetch notes' }); }
    },

    create: async (req, res) => {
        try {
            const note = await Note.create({ ...req.body, user_id: req.user.id });
            await Activity.create({ action: 'created note', entity_type: 'note', entity_id: note.id, user_id: req.user.id });
            res.status(201).json(note);
        } catch (error) { res.status(500).json({ error: 'Failed to create note' }); }
    },

    update: async (req, res) => {
        try {
            const note = await Note.findById(req.params.id);
            if (!note || note.user_id !== req.user.id) return res.status(404).json({ error: 'Note not found' });
            const updated = await Note.update(req.params.id, req.body);
            res.json(updated);
        } catch (error) { res.status(500).json({ error: 'Failed to update note' }); }
    },

    delete: async (req, res) => {
        try {
            const note = await Note.findById(req.params.id);
            if (!note || note.user_id !== req.user.id) return res.status(404).json({ error: 'Note not found' });
            await Note.delete(req.params.id);
            res.json({ message: 'Note deleted' });
        } catch (error) { res.status(500).json({ error: 'Failed to delete note' }); }
    },

    togglePin: async (req, res) => {
        try {
            const note = await Note.togglePin(req.params.id);
            res.json(note);
        } catch (error) { res.status(500).json({ error: 'Failed to toggle pin' }); }
    }
};

module.exports = noteController;
