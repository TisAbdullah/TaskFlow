// ============================================
// Task Model - Database operations for tasks
// ============================================

const db = require('../config/db');

class Task {
    // Get tasks for a user with optional filters
    static async findByUser(userId, filters = {}) {
        let query = `SELECT t.*, u.name as assigned_name 
                     FROM tasks t 
                     LEFT JOIN users u ON t.assigned_to = u.id 
                     WHERE t.user_id = ?`;
        const params = [userId];

        if (filters.status) {
            query += ' AND t.status = ?';
            params.push(filters.status);
        }
        if (filters.priority) {
            query += ' AND t.priority = ?';
            params.push(filters.priority);
        }
        if (filters.search) {
            query += ' AND (t.title LIKE ? OR t.description LIKE ?)';
            params.push(`%${filters.search}%`, `%${filters.search}%`);
        }

        query += ' ORDER BY t.created_at DESC';

        if (filters.limit) {
            const limit = parseInt(filters.limit) || 10;
            const offset = parseInt(filters.offset) || 0;
            query += ` LIMIT ${limit} OFFSET ${offset}`;
        }

        return db.prepare(query).all(...params);
    }

    // Find a single task by ID
    static async findById(id) {
        return db.prepare(
            `SELECT t.*, u.name as assigned_name 
             FROM tasks t LEFT JOIN users u ON t.assigned_to = u.id 
             WHERE t.id = ?`
        ).get(id);
    }

    // Create a new task
    static async create(data) {
        const result = db.prepare(
            `INSERT INTO tasks (title, description, status, priority, due_date, tags, user_id, assigned_to, team_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(
            data.title, data.description || null,
            data.status || 'pending', data.priority || 'medium',
            data.due_date || null, data.tags || null,
            data.user_id, data.assigned_to || null, data.team_id || null
        );
        return this.findById(result.lastInsertRowid);
    }

    // Update a task
    static async update(id, data) {
        const fields = [];
        const values = [];
        const allowed = ['title', 'description', 'status', 'priority', 'due_date', 'tags', 'assigned_to', 'team_id'];

        allowed.forEach(key => {
            if (data[key] !== undefined) {
                fields.push(`${key} = ?`);
                values.push(data[key]);
            }
        });

        if (fields.length === 0) return this.findById(id);
        values.push(id);

        db.prepare(`UPDATE tasks SET ${fields.join(', ')}, updated_at = datetime('now') WHERE id = ?`).run(...values);
        return this.findById(id);
    }

    // Update task status
    static async updateStatus(id, status) {
        db.prepare("UPDATE tasks SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, id);
        return this.findById(id);
    }

    // Delete a task
    static async delete(id) {
        const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
        return result.changes > 0;
    }

    // Get task statistics for a user
    static async getStats(userId) {
        const row = db.prepare(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
                SUM(CASE WHEN due_date < date('now') AND status != 'completed' THEN 1 ELSE 0 END) as overdue,
                SUM(CASE WHEN due_date >= date('now') AND due_date <= date('now', '+7 days') AND status != 'completed' THEN 1 ELSE 0 END) as upcoming
            FROM tasks WHERE user_id = ?
        `).get(userId);
        return row;
    }

    // Get tasks completed per day (last 7 days)
    static async getWeeklyStats(userId) {
        return db.prepare(`
            SELECT date(updated_at) as date, COUNT(*) as count
            FROM tasks 
            WHERE user_id = ? AND status = 'completed' 
                AND updated_at >= date('now', '-7 days')
            GROUP BY date(updated_at)
            ORDER BY date
        `).all(userId);
    }

    // Count total tasks
    static async count(userId) {
        const row = db.prepare('SELECT COUNT(*) as count FROM tasks WHERE user_id = ?').get(userId);
        return row.count;
    }
}

module.exports = Task;
