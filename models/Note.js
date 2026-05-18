// ============================================
// Note Model
// ============================================
const db = require('../config/db');

class Note {
    static async findByUser(userId) {
        return db.prepare(
            'SELECT * FROM notes WHERE user_id = ? ORDER BY is_pinned DESC, updated_at DESC'
        ).all(userId);
    }

    static async findById(id) {
        return db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
    }

    static async create(data) {
        const result = db.prepare(
            'INSERT INTO notes (title, content, is_pinned, user_id) VALUES (?, ?, ?, ?)'
        ).run(data.title, data.content || '', data.is_pinned ? 1 : 0, data.user_id);
        return this.findById(result.lastInsertRowid);
    }

    static async update(id, data) {
        const fields = [];
        const values = [];
        ['title', 'content', 'is_pinned'].forEach(key => {
            if (data[key] !== undefined) {
                fields.push(`${key} = ?`);
                values.push(key === 'is_pinned' ? (data[key] ? 1 : 0) : data[key]);
            }
        });
        if (fields.length === 0) return null;
        values.push(id);
        db.prepare(`UPDATE notes SET ${fields.join(', ')}, updated_at = datetime('now') WHERE id = ?`).run(...values);
        return this.findById(id);
    }

    static async delete(id) {
        const result = db.prepare('DELETE FROM notes WHERE id = ?').run(id);
        return result.changes > 0;
    }

    static async togglePin(id) {
        db.prepare('UPDATE notes SET is_pinned = CASE WHEN is_pinned = 1 THEN 0 ELSE 1 END WHERE id = ?').run(id);
        return this.findById(id);
    }
}

module.exports = Note;
