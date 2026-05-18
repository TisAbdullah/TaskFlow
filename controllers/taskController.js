// ============================================
// Task Controller - CRUD + Search/Filter/Export
// ============================================

const Task = require('../models/Task');
const Activity = require('../models/Activity');

const taskController = {
    // GET /api/tasks
    getAll: async (req, res) => {
        try {
            const filters = {
                status: req.query.status,
                priority: req.query.priority,
                search: req.query.search,
                limit: req.query.limit,
                offset: req.query.offset
            };
            const tasks = await Task.findByUser(req.user.id, filters);
            const total = await Task.count(req.user.id);
            res.json({ tasks, total });
        } catch (error) {
            console.error('Get tasks error:', error);
            res.status(500).json({ error: 'Failed to fetch tasks' });
        }
    },

    // POST /api/tasks
    create: async (req, res) => {
        try {
            const task = await Task.create({ ...req.body, user_id: req.user.id });
            await Activity.create({ action: 'created task', entity_type: 'task', entity_id: task.id, user_id: req.user.id });
            res.status(201).json(task);
        } catch (error) {
            console.error('Create task error:', error);
            res.status(500).json({ error: 'Failed to create task' });
        }
    },

    // PUT /api/tasks/:id
    update: async (req, res) => {
        try {
            const task = await Task.findById(req.params.id);
            if (!task || task.user_id !== req.user.id) {
                return res.status(404).json({ error: 'Task not found' });
            }
            const updated = await Task.update(req.params.id, req.body);
            await Activity.create({ action: 'updated task', entity_type: 'task', entity_id: task.id, user_id: req.user.id });
            res.json(updated);
        } catch (error) {
            res.status(500).json({ error: 'Failed to update task' });
        }
    },

    // DELETE /api/tasks/:id
    delete: async (req, res) => {
        try {
            const task = await Task.findById(req.params.id);
            if (!task || task.user_id !== req.user.id) {
                return res.status(404).json({ error: 'Task not found' });
            }
            await Task.delete(req.params.id);
            await Activity.create({ action: 'deleted task', entity_type: 'task', entity_id: parseInt(req.params.id), user_id: req.user.id });
            res.json({ message: 'Task deleted' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete task' });
        }
    },

    // PATCH /api/tasks/:id/status
    updateStatus: async (req, res) => {
        try {
            const { status } = req.body;
            const task = await Task.findById(req.params.id);
            if (!task || task.user_id !== req.user.id) {
                return res.status(404).json({ error: 'Task not found' });
            }
            const updated = await Task.updateStatus(req.params.id, status);
            await Activity.create({ action: `marked task as ${status}`, entity_type: 'task', entity_id: task.id, user_id: req.user.id });
            res.json(updated);
        } catch (error) {
            res.status(500).json({ error: 'Failed to update status' });
        }
    },

    // GET /api/tasks/export/:format
    export: async (req, res) => {
        try {
            const tasks = await Task.findByUser(req.user.id);
            const format = req.params.format;

            if (format === 'csv') {
                const { Parser } = require('json2csv');
                const fields = ['id', 'title', 'description', 'status', 'priority', 'due_date', 'tags', 'created_at'];
                const parser = new Parser({ fields });
                const csv = parser.parse(tasks);
                res.header('Content-Type', 'text/csv');
                res.header('Content-Disposition', 'attachment; filename=tasks.csv');
                return res.send(csv);
            }

            // JSON fallback
            res.json(tasks);
        } catch (error) {
            res.status(500).json({ error: 'Failed to export tasks' });
        }
    }
};

module.exports = taskController;
