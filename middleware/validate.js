// ============================================
// Request Validation Middleware
// ============================================

const validate = {
    // Validate signup fields
    signup: (req, res, next) => {
        const { name, email, password } = req.body;
        const errors = [];

        if (!name || name.trim().length < 2) errors.push('Name must be at least 2 characters');
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Valid email is required');
        if (!password || password.length < 6) errors.push('Password must be at least 6 characters');

        if (errors.length > 0) return res.status(400).json({ error: errors[0], errors });
        next();
    },

    // Validate login fields
    login: (req, res, next) => {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        next();
    },

    // Validate task creation
    task: (req, res, next) => {
        const { title } = req.body;
        if (!title || title.trim().length === 0) {
            return res.status(400).json({ error: 'Task title is required' });
        }
        next();
    },

    // Validate meeting creation
    meeting: (req, res, next) => {
        const { title, meeting_date } = req.body;
        if (!title) return res.status(400).json({ error: 'Meeting title is required' });
        if (!meeting_date) return res.status(400).json({ error: 'Meeting date is required' });
        next();
    },

    // Validate note creation
    note: (req, res, next) => {
        const { title } = req.body;
        if (!title || title.trim().length === 0) {
            return res.status(400).json({ error: 'Note title is required' });
        }
        next();
    }
};

module.exports = validate;
