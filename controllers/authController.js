// ============================================
// Auth Controller - Signup, Login, Profile
// ============================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Activity = require('../models/Activity');

const authController = {
    // POST /api/auth/signup
    signup: async (req, res) => {
        try {
            const { name, email, password } = req.body;

            // Check if user already exists
            const existing = await User.findByEmail(email);
            if (existing) {
                return res.status(400).json({ error: 'Email already registered' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user
            const user = await User.create({ name, email, password: hashedPassword });

            // Generate JWT token
            const token = jwt.sign(
                { id: user.id, name: user.name, email: user.email, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            // Log activity
            await Activity.create({ action: 'signed up', entity_type: 'user', entity_id: user.id, user_id: user.id });

            res.status(201).json({ message: 'Account created successfully', token, user });
        } catch (error) {
            console.error('Signup error:', error);
            res.status(500).json({ error: 'Failed to create account' });
        }
    },

    // POST /api/auth/login
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            // Find user
            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            // Verify password
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            // Generate JWT token
            const token = jwt.sign(
                { id: user.id, name: user.name, email: user.email, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.json({
                message: 'Login successful',
                token,
                user: { id: user.id, name: user.name, email: user.email, role: user.role, theme_preference: user.theme_preference }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Login failed' });
        }
    },

    // GET /api/auth/profile
    getProfile: async (req, res) => {
        try {
            const user = await User.findById(req.user.id);
            if (!user) return res.status(404).json({ error: 'User not found' });
            res.json(user);
        } catch (error) {
            res.status(500).json({ error: 'Failed to get profile' });
        }
    },

    // PUT /api/auth/profile
    updateProfile: async (req, res) => {
        try {
            const user = await User.update(req.user.id, req.body);
            res.json({ message: 'Profile updated', user });
        } catch (error) {
            res.status(500).json({ error: 'Failed to update profile' });
        }
    }
};

module.exports = authController;
