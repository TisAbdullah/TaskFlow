// ============================================
// TaskFlow - Mock Server for Frontend Testing
// ============================================

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ============================================
// MOCK DATA
// ============================================
const mockUser = { id: 1, name: "Test User", email: "test@example.com", avatar_url: null, role: "admin" };
const mockTasks = [
    { id: 1, title: "Design Landing Page", description: "Create mockups for the new landing page.", status: "todo", priority: "high", due_date: new Date().toISOString(), created_at: new Date().toISOString() },
    { id: 2, title: "Develop API", description: "Set up the mock API for testing.", status: "in_progress", priority: "high", due_date: new Date().toISOString(), created_at: new Date().toISOString() },
    { id: 3, title: "Database Schema", description: "Design the initial DB schema.", status: "done", priority: "medium", due_date: new Date().toISOString(), created_at: new Date().toISOString() },
    { id: 4, title: "User Testing", description: "Conduct user testing on the beta version.", status: "review", priority: "low", due_date: new Date(Date.now() + 86400000 * 2).toISOString(), created_at: new Date().toISOString() },
];
const mockTeams = [
    { id: 1, name: "Engineering", description: "Core dev team", role: "owner" },
    { id: 2, name: "Design", description: "UI/UX team", role: "member" }
];
const mockMeetings = [
    { id: 1, title: "Daily Standup", description: "Daily sync", start_time: new Date().toISOString(), end_time: new Date(Date.now() + 3600000).toISOString(), link: "https://zoom.us/test" }
];
const mockNotes = [
    { id: 1, title: "Project Ideas", content: "Some ideas for the project. Needs more brainstorming.", is_pinned: 1, color: "#2d3748", updated_at: new Date().toISOString() },
    { id: 2, title: "Meeting Notes", content: "Discussed the new feature roadmap.", is_pinned: 0, color: "#1a202c", updated_at: new Date().toISOString() }
];
const mockNotifications = [
    { id: 1, message: "Welcome to TaskFlow Mock!", type: "info", is_read: 0, created_at: new Date().toISOString() },
    { id: 2, message: "You have a meeting soon.", type: "warning", is_read: 0, created_at: new Date().toISOString() }
];

// ============================================
// API ROUTES MOCKS
// ============================================

// Auth
app.post('/api/auth/login', (req, res) => res.json({ token: "mock_token", user: mockUser }));
app.post('/api/auth/signup', (req, res) => res.json({ token: "mock_token", user: mockUser }));

// Dashboard Stats
app.get('/api/dashboard/stats', (req, res) => res.json({
    stats: { totalTasks: mockTasks.length, completedTasks: mockTasks.filter(t => t.status === 'done').length, activeTeams: mockTeams.length, upcomingMeetings: mockMeetings.length },
    tasksByStatus: { todo: mockTasks.filter(t => t.status === 'todo').length, in_progress: mockTasks.filter(t => t.status === 'in_progress').length, review: mockTasks.filter(t => t.status === 'review').length, done: mockTasks.filter(t => t.status === 'done').length },
    tasksByPriority: { high: mockTasks.filter(t => t.priority === 'high').length, medium: mockTasks.filter(t => t.priority === 'medium').length, low: mockTasks.filter(t => t.priority === 'low').length },
    completionRate: [10, 20, 30, 40, 50, 60, 33]
}));

// Tasks
app.get('/api/tasks', (req, res) => {
    let tasks = [...mockTasks];
    if (req.query.priority) tasks = tasks.filter(t => t.priority === req.query.priority);
    if (req.query.limit) tasks = tasks.slice(0, parseInt(req.query.limit));
    res.json(tasks);
});
app.post('/api/tasks', (req, res) => { const t = { id: Date.now(), ...req.body, created_at: new Date().toISOString() }; mockTasks.push(t); res.status(201).json(t); });
app.put('/api/tasks/:id', (req, res) => { 
    const idx = mockTasks.findIndex(t => t.id == req.params.id);
    if (idx !== -1) mockTasks[idx] = { ...mockTasks[idx], ...req.body };
    res.json(mockTasks[idx] || req.body); 
});
app.patch('/api/tasks/:id/status', (req, res) => {
    const idx = mockTasks.findIndex(t => t.id == req.params.id);
    if (idx !== -1) mockTasks[idx].status = req.body.status;
    res.json({ success: true });
});
app.delete('/api/tasks/:id', (req, res) => {
    const idx = mockTasks.findIndex(t => t.id == req.params.id);
    if (idx !== -1) mockTasks.splice(idx, 1);
    res.json({ success: true });
});

// Teams
app.get('/api/teams', (req, res) => res.json(mockTeams));
app.post('/api/teams', (req, res) => { const t = { id: Date.now(), ...req.body, role: 'owner' }; mockTeams.push(t); res.status(201).json(t); });
app.get('/api/teams/:id/members', (req, res) => res.json([{ ...mockUser, role: 'owner' }]));
app.get('/api/teams/users', (req, res) => res.json([mockUser]));
app.post('/api/teams/:id/members', (req, res) => res.status(201).json({ success: true }));

// Meetings
app.get('/api/meetings', (req, res) => res.json(mockMeetings));
app.post('/api/meetings', (req, res) => { const m = { id: Date.now(), ...req.body }; mockMeetings.push(m); res.status(201).json(m); });
app.put('/api/meetings/:id', (req, res) => {
    const idx = mockMeetings.findIndex(t => t.id == req.params.id);
    if (idx !== -1) mockMeetings[idx] = { ...mockMeetings[idx], ...req.body };
    res.json(mockMeetings[idx] || req.body);
});
app.delete('/api/meetings/:id', (req, res) => {
    const idx = mockMeetings.findIndex(t => t.id == req.params.id);
    if (idx !== -1) mockMeetings.splice(idx, 1);
    res.json({ success: true });
});

// Notes
app.get('/api/notes', (req, res) => res.json(mockNotes));
app.post('/api/notes', (req, res) => { const n = { id: Date.now(), ...req.body, updated_at: new Date().toISOString() }; mockNotes.push(n); res.status(201).json(n); });
app.put('/api/notes/:id', (req, res) => {
    const idx = mockNotes.findIndex(t => t.id == req.params.id);
    if (idx !== -1) mockNotes[idx] = { ...mockNotes[idx], ...req.body, updated_at: new Date().toISOString() };
    res.json(mockNotes[idx] || req.body);
});
app.patch('/api/notes/:id/pin', (req, res) => {
    const idx = mockNotes.findIndex(t => t.id == req.params.id);
    if (idx !== -1) mockNotes[idx].is_pinned = !mockNotes[idx].is_pinned;
    res.json({ success: true });
});
app.delete('/api/notes/:id', (req, res) => {
    const idx = mockNotes.findIndex(t => t.id == req.params.id);
    if (idx !== -1) mockNotes.splice(idx, 1);
    res.json({ success: true });
});

// Notifications
app.get('/api/notifications', (req, res) => res.json(mockNotifications));
app.patch('/api/notifications/:id/read', (req, res) => {
    const idx = mockNotifications.findIndex(t => t.id == req.params.id);
    if (idx !== -1) mockNotifications[idx].is_read = 1;
    res.json({ success: true });
});
app.patch('/api/notifications/read-all', (req, res) => {
    mockNotifications.forEach(n => n.is_read = 1);
    res.json({ success: true });
});

// ============================================
// Serve frontend pages
// ============================================
app.get('*', (req, res) => {
    if (req.path.includes('.')) {
        return res.status(404).end();
    }
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`\n========================================================`);
    console.log(`🚀 MOCK Server running on http://localhost:${PORT}`);
    console.log(`📁 Serving frontend from: ${path.join(__dirname, '..', 'frontend')}`);
    console.log(`⚠️  NOTE: Data is NOT saved to a database. It resets on restart.`);
    console.log(`========================================================\n`);
});
