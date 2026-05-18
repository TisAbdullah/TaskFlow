// ============================================
// Dashboard Controller - Aggregated Statistics
// ============================================
const Task = require('../models/Task');
const Team = require('../models/Team');
const Meeting = require('../models/Meeting');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');

const dashboardController = {
    // GET /api/dashboard/stats
    getStats: async (req, res) => {
        try {
            const userId = req.user.id;
            const taskStats = await Task.getStats(userId);
            const memberCount = await Team.memberCount(userId);
            const upcomingMeetings = await Meeting.countUpcoming(userId);
            const weeklyStats = await Task.getWeeklyStats(userId);
            const recentActivity = await Activity.recent(userId, 10);
            const notifications = await Notification.findByUser(userId);
            const unreadCount = await Notification.unreadCount(userId);

            // Calculate productivity percentage
            const total = taskStats.total || 1;
            const productivity = Math.round((taskStats.completed / total) * 100);

            res.json({
                stats: {
                    total: taskStats.total || 0,
                    completed: taskStats.completed || 0,
                    pending: taskStats.pending || 0,
                    in_progress: taskStats.in_progress || 0,
                    overdue: taskStats.overdue || 0,
                    upcoming: taskStats.upcoming || 0,
                    memberCount,
                    upcomingMeetings,
                    productivity
                },
                weeklyStats,
                recentActivity,
                notifications,
                unreadCount
            });
        } catch (error) {
            console.error('Dashboard error:', error);
            res.status(500).json({ error: 'Failed to fetch dashboard data' });
        }
    }
};

module.exports = dashboardController;
