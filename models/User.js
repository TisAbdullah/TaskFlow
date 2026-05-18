// ============================================
// User Model - Database operations for users
// ============================================

const db = require('../config/db');

class User {
    // Find user by email
    static async findByEmail(email) {
        return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    }

    // Find user by ID
    static async findById(id) {
        return db.prepare(
            'SELECT id, name, email, avatar_url, role, theme_preference, created_at FROM users WHERE id = ?'
        ).get(id);
    }

    // Create new user
    static async create(data) {
        const result = db.prepare(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)'
        ).run(data.name, data.email, data.password, data.role || 'member');
        return { id: result.lastInsertRowid, name: data.name, email: data.email, role: data.role || 'member' };
    }

    // Update user profile
    static async update(id, data) {
        const fields = [];
        const values = [];
        const allowed = ['name', 'email', 'avatar_url', 'theme_preference'];

        allowed.forEach(key => {
            if (data[key] !== undefined) {
                fields.push(`${key} = ?`);
                values.push(data[key]);
            }
        });

        if (fields.length === 0) return null;
        values.push(id);

        db.prepare(`UPDATE users SET ${fields.join(', ')}, updated_at = datetime('now') WHERE id = ?`).run(...values);
        return this.findById(id);
    }

    // Get all users (for team member selection)
    static async findAll() {
        return db.prepare(
            'SELECT id, name, email, avatar_url, role, created_at FROM users ORDER BY name'
        ).all();
    }

    // Count total users
    static async count() {
        const row = db.prepare('SELECT COUNT(*) as count FROM users').get();
        return row.count;
    }
}

module.exports = User;
