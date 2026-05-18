// ============================================
// Database Seed Script (SQLite)
// Run: npm run seed (from backend directory)
// Creates sample data with properly hashed passwords
// ============================================

const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

async function seed() {
    const DB_PATH = path.join(__dirname, 'data', 'taskflow.db');

    // Ensure data directory exists
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    const db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    // Initialize schema
    const schemaPath = path.join(__dirname, '..', 'database', 'sqlite_schema.sql');
    if (fs.existsSync(schemaPath)) {
        const schema = fs.readFileSync(schemaPath, 'utf-8');
        const statements = schema.split(';').filter(s => s.trim());
        for (const stmt of statements) {
            try {
                db.exec(stmt);
            } catch (err) {
                if (!err.message.includes('already exists')) {
                    console.error('Schema error:', err.message);
                }
            }
        }
    }

    try {
        console.log('🌱 Starting database seed...');

        // Clear existing data
        db.exec('DELETE FROM activities');
        db.exec('DELETE FROM notifications');
        db.exec('DELETE FROM notes');
        db.exec('DELETE FROM meetings');
        db.exec('DELETE FROM tasks');
        db.exec('DELETE FROM team_members');
        db.exec('DELETE FROM teams');
        db.exec('DELETE FROM users');
        try { db.exec("DELETE FROM sqlite_sequence"); } catch (e) {}

        // Hash passwords
        const hash = await bcrypt.hash('password123', 10);

        // Insert Users
        const insertUser = db.prepare(
            'INSERT INTO users (name, email, password, role, theme_preference) VALUES (?, ?, ?, ?, ?)'
        );
        insertUser.run('Admin User', 'admin@taskflow.com', hash, 'admin', 'dark');
        insertUser.run('Sarah Manager', 'sarah@taskflow.com', hash, 'manager', 'dark');
        insertUser.run('John Developer', 'john@taskflow.com', hash, 'member', 'light');
        insertUser.run('Emily Designer', 'emily@taskflow.com', hash, 'member', 'dark');
        console.log('✅ Users created');

        // Insert Teams
        const insertTeam = db.prepare(
            'INSERT INTO teams (name, description, created_by) VALUES (?, ?, ?)'
        );
        insertTeam.run('Frontend Team', 'Handles all UI/UX development', 1);
        insertTeam.run('Backend Team', 'API and database development', 1);

        // Insert Team Members
        const insertMember = db.prepare(
            'INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)'
        );
        insertMember.run(1, 1, 'admin');
        insertMember.run(1, 2, 'manager');
        insertMember.run(1, 3, 'member');
        insertMember.run(1, 4, 'member');
        insertMember.run(2, 1, 'admin');
        insertMember.run(2, 2, 'manager');
        insertMember.run(2, 3, 'member');
        console.log('✅ Teams created');

        // Insert Tasks
        const insertTask = db.prepare(
            `INSERT INTO tasks (title, description, status, priority, due_date, tags, user_id, assigned_to, team_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        );
        insertTask.run('Design Dashboard UI', 'Create wireframes and mockups for the main dashboard', 'completed', 'high', dateDaysFromNow(-2), 'design,ui', 1, 4, 1);
        insertTask.run('Setup Express Server', 'Initialize Node.js backend with Express framework', 'completed', 'urgent', dateDaysFromNow(-5), 'backend,setup', 1, 3, 2);
        insertTask.run('Create Database Schema', 'Design and implement database tables', 'in_progress', 'high', dateDaysFromNow(1), 'database,sql', 1, 3, 2);
        insertTask.run('Implement JWT Auth', 'Add authentication with JWT tokens', 'in_progress', 'urgent', dateDaysFromNow(2), 'auth,security', 1, 3, 2);
        insertTask.run('Build Task Board', 'Create Kanban-style task board with drag and drop', 'pending', 'high', dateDaysFromNow(5), 'frontend,feature', 1, 4, 1);
        insertTask.run('API Documentation', 'Document all REST API endpoints', 'pending', 'medium', dateDaysFromNow(7), 'docs', 1, 2, 2);
        insertTask.run('Mobile Responsive Design', 'Make all pages mobile-friendly', 'pending', 'medium', dateDaysFromNow(10), 'css,responsive', 1, 4, 1);
        insertTask.run('Unit Testing', 'Write tests for critical backend functions', 'pending', 'low', dateDaysFromNow(14), 'testing', 1, 3, 2);
        insertTask.run('User Profile Page', 'Create profile editing interface', 'pending', 'low', dateDaysFromNow(8), 'frontend,feature', 1, 4, 1);
        insertTask.run('Deploy to Production', 'Setup CI/CD and deploy application', 'pending', 'high', dateDaysFromNow(20), 'devops', 1, 2, null);
        insertTask.run('Fix Login Bug', 'Session not persisting after page refresh', 'in_progress', 'urgent', dateDaysFromNow(0), 'bug,auth', 1, 3, 2);
        insertTask.run('Add Dark Mode', 'Implement theme switching functionality', 'completed', 'medium', dateDaysFromNow(-1), 'frontend,ui', 1, 4, 1);
        console.log('✅ Tasks created');

        // Insert Meetings
        const insertMeeting = db.prepare(
            'INSERT INTO meetings (title, description, meeting_date, duration_minutes, created_by, team_id) VALUES (?, ?, ?, ?, ?, ?)'
        );
        insertMeeting.run('Sprint Planning', 'Plan tasks for the upcoming sprint', datetimeDaysFromNow(1), 60, 1, 1);
        insertMeeting.run('Code Review Session', 'Review PRs and discuss code quality', datetimeDaysFromNow(3), 45, 2, 2);
        insertMeeting.run('Design Sync', 'Sync on UI/UX progress and feedback', datetimeDaysFromNow(5), 30, 1, 1);
        insertMeeting.run('Team Retrospective', 'Discuss what went well and improvements', datetimeDaysFromNow(7), 60, 1, null);
        console.log('✅ Meetings created');

        // Insert Notes
        const insertNote = db.prepare(
            'INSERT INTO notes (title, content, is_pinned, user_id) VALUES (?, ?, ?, ?)'
        );
        insertNote.run('Project Guidelines', 'Follow clean code principles. Use meaningful variable names. Write comments for complex logic. Keep functions small and focused.', 1, 1);
        insertNote.run('API Endpoints List', 'Auth: /api/auth/login, /api/auth/signup\nTasks: /api/tasks (CRUD)\nTeams: /api/teams\nMeetings: /api/meetings', 1, 1);
        insertNote.run('Meeting Notes - Sprint 1', 'Discussed project timeline. Agreed on 2-week sprints. Priority: Auth system first, then task management.', 0, 1);
        insertNote.run('Design Resources', 'Color palette: Purple #7c3aed, Cyan #06b6d4\nFont: Inter\nIcons: Lucide\nInspiration: Notion, Linear', 0, 1);
        insertNote.run('Bug Tracker', 'Bug 1: Login redirect issue - Fixed\nBug 2: Task drag not saving - In Progress\nBug 3: Calendar off by one - Pending', 1, 1);
        console.log('✅ Notes created');

        // Insert Notifications
        const insertNotif = db.prepare(
            'INSERT INTO notifications (message, type, is_read, user_id) VALUES (?, ?, ?, ?)'
        );
        insertNotif.run('Welcome to TaskFlow! Get started by creating your first task.', 'info', 0, 1);
        insertNotif.run('Sprint Planning meeting scheduled for tomorrow', 'meeting', 0, 1);
        insertNotif.run('Task "Design Dashboard UI" has been completed', 'success', 1, 1);
        insertNotif.run('Task "Fix Login Bug" is overdue!', 'warning', 0, 1);
        insertNotif.run('Sarah joined the Frontend Team', 'info', 1, 1);

        // Insert Activities
        const insertActivity = db.prepare(
            'INSERT INTO activities (action, entity_type, entity_id, user_id) VALUES (?, ?, ?, ?)'
        );
        insertActivity.run('created task', 'task', 1, 1);
        insertActivity.run('completed task', 'task', 1, 4);
        insertActivity.run('created team', 'team', 1, 1);
        insertActivity.run('added member to team', 'team', 1, 1);
        insertActivity.run('scheduled meeting', 'meeting', 1, 1);
        insertActivity.run('created note', 'note', 1, 1);
        insertActivity.run('updated task status', 'task', 3, 3);
        insertActivity.run('completed task', 'task', 2, 3);
        console.log('✅ Activities & Notifications created');

        console.log('\n🎉 Database seeded successfully!');
        console.log('📧 Login credentials:');
        console.log('   Email: admin@taskflow.com');
        console.log('   Password: password123');

        db.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error.message);
        db.close();
        process.exit(1);
    }
}

// Helper: get date string N days from now (YYYY-MM-DD)
function dateDaysFromNow(n) {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d.toISOString().split('T')[0];
}

// Helper: get datetime string N days from now (YYYY-MM-DD HH:MM:SS)
function datetimeDaysFromNow(n) {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d.toISOString().replace('T', ' ').split('.')[0];
}

seed();
