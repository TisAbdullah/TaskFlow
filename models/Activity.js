// ============================================
// Activity Model (User Activity Logs)
// ============================================
const db = require('../config/db');

class Activity {
    static async findByUser(userId, limit = 20) {
        return db.prepare(`
            SELECT a.*, u.name as user_name
            FROM activities a JOIN users u ON a.user_id = u.id
            WHERE a.user_id = ?
            ORDER BY a.created_at DESC LIMIT ?
        `).all(userId, limit);
    }

    static async create(data) {
        const result = db.prepare(
            'INSERT INTO activities (action, entity_type, entity_id, user_id) VALUES (?, ?, ?, ?)'
        ).run(data.action, data.entity_type, data.entity_id || null, data.user_id);
        return { id: result.lastInsertRowid, ...data };
    }

    static async recent(userId, limit = 10) {
        return this.findByUser(userId, limit);
    }
}

module.exports = Activity;
