// ============================================
// Notification Model
// ============================================
const db = require('../config/db');

class Notification {
    static async findByUser(userId) {
        return db.prepare(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50'
        ).all(userId);
    }

    static async create(data) {
        const result = db.prepare(
            'INSERT INTO notifications (message, type, user_id) VALUES (?, ?, ?)'
        ).run(data.message, data.type || 'info', data.user_id);
        return { id: result.lastInsertRowid, ...data };
    }

    static async markRead(id) {
        db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(id);
    }

    static async markAllRead(userId) {
        db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(userId);
    }

    static async unreadCount(userId) {
        const row = db.prepare(
            'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0'
        ).get(userId);
        return row.count;
    }
}

module.exports = Notification;
