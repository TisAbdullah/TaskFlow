// ============================================
// Meeting Model
// ============================================
const db = require('../config/db');

class Meeting {
    static async findByUser(userId) {
        return db.prepare(`
            SELECT m.*, u.name as creator_name, t.name as team_name
            FROM meetings m
            JOIN users u ON m.created_by = u.id
            LEFT JOIN teams t ON m.team_id = t.id
            WHERE m.created_by = ? OR m.team_id IN (
                SELECT team_id FROM team_members WHERE user_id = ?
            )
            ORDER BY m.meeting_date ASC
        `).all(userId, userId);
    }

    static async create(data) {
        const result = db.prepare(
            'INSERT INTO meetings (title, description, meeting_date, duration_minutes, created_by, team_id) VALUES (?, ?, ?, ?, ?, ?)'
        ).run(data.title, data.description || null, data.meeting_date, data.duration_minutes || 30, data.created_by, data.team_id || null);
        return { id: result.lastInsertRowid, ...data };
    }

    static async update(id, data) {
        const fields = [];
        const values = [];
        ['title', 'description', 'meeting_date', 'duration_minutes', 'team_id'].forEach(key => {
            if (data[key] !== undefined) { fields.push(`${key} = ?`); values.push(data[key]); }
        });
        if (fields.length === 0) return null;
        values.push(id);
        db.prepare(`UPDATE meetings SET ${fields.join(', ')} WHERE id = ?`).run(...values);
        return this.findById(id);
    }

    static async findById(id) {
        return db.prepare('SELECT * FROM meetings WHERE id = ?').get(id);
    }

    static async delete(id) {
        const result = db.prepare('DELETE FROM meetings WHERE id = ?').run(id);
        return result.changes > 0;
    }

    static async upcoming(userId, limit = 5) {
        return db.prepare(`
            SELECT m.*, u.name as creator_name
            FROM meetings m JOIN users u ON m.created_by = u.id
            WHERE m.meeting_date >= datetime('now') AND (m.created_by = ? OR m.team_id IN (
                SELECT team_id FROM team_members WHERE user_id = ?
            ))
            ORDER BY m.meeting_date ASC LIMIT ?
        `).all(userId, userId, limit);
    }

    static async countUpcoming(userId) {
        const row = db.prepare(`
            SELECT COUNT(*) as count FROM meetings 
            WHERE meeting_date >= datetime('now') AND (created_by = ? OR team_id IN (
                SELECT team_id FROM team_members WHERE user_id = ?
            ))
        `).get(userId, userId);
        return row.count;
    }
}

module.exports = Meeting;
