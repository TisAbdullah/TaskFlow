// ============================================
// Team Model - Database operations for teams
// ============================================

const db = require('../config/db');

class Team {
    static async findByUser(userId) {
        return db.prepare(`
            SELECT t.*, 
                   u.name as creator_name,
                   (SELECT COUNT(*) FROM team_members WHERE team_id = t.id) as member_count
            FROM teams t
            JOIN team_members tm ON t.id = tm.team_id
            JOIN users u ON t.created_by = u.id
            WHERE tm.user_id = ?
            ORDER BY t.created_at DESC
        `).all(userId);
    }

    static async findById(id) {
        return db.prepare('SELECT * FROM teams WHERE id = ?').get(id);
    }

    static async create(data) {
        const result = db.prepare(
            'INSERT INTO teams (name, description, created_by) VALUES (?, ?, ?)'
        ).run(data.name, data.description || null, data.created_by);
        // Add creator as admin member
        db.prepare(
            'INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)'
        ).run(result.lastInsertRowid, data.created_by, 'admin');
        return { id: result.lastInsertRowid, ...data };
    }

    static async getMembers(teamId) {
        return db.prepare(`
            SELECT u.id, u.name, u.email, u.avatar_url, tm.role, tm.joined_at,
                   (SELECT COUNT(*) FROM tasks WHERE assigned_to = u.id AND team_id = ?) as task_count
            FROM team_members tm
            JOIN users u ON tm.user_id = u.id
            WHERE tm.team_id = ?
            ORDER BY tm.role, u.name
        `).all(teamId, teamId);
    }

    static async addMember(teamId, userId, role = 'member') {
        db.prepare(
            'INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)'
        ).run(teamId, userId, role);
        return true;
    }

    static async removeMember(teamId, userId) {
        const result = db.prepare(
            'DELETE FROM team_members WHERE team_id = ? AND user_id = ?'
        ).run(teamId, userId);
        return result.changes > 0;
    }

    static async memberCount(userId) {
        const row = db.prepare(`
            SELECT COUNT(DISTINCT tm2.user_id) as count
            FROM team_members tm
            JOIN team_members tm2 ON tm.team_id = tm2.team_id
            WHERE tm.user_id = ? AND tm2.user_id != ?
        `).get(userId, userId);
        return row.count;
    }
}

module.exports = Team;
