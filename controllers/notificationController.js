// ============================================
// Notification Controller
// ============================================
const Notification = require('../models/Notification');

const notificationController = {
    getAll: async (req, res) => {
        try {
            const notifications = await Notification.findByUser(req.user.id);
            const unread = await Notification.unreadCount(req.user.id);
            res.json({ notifications, unreadCount: unread });
        } catch (error) { res.status(500).json({ error: 'Failed to fetch notifications' }); }
    },

    markRead: async (req, res) => {
        try {
            await Notification.markRead(req.params.id);
            res.json({ message: 'Marked as read' });
        } catch (error) { res.status(500).json({ error: 'Failed to mark notification' }); }
    },

    markAllRead: async (req, res) => {
        try {
            await Notification.markAllRead(req.user.id);
            res.json({ message: 'All marked as read' });
        } catch (error) { res.status(500).json({ error: 'Failed to mark all' }); }
    }
};

module.exports = notificationController;
