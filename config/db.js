// ============================================
// Database Configuration - SQLite via better-sqlite3
// ============================================

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'data', 'taskflow.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize schema if tables don't exist
function initializeDatabase() {
    const schemaPath = path.join(__dirname, '..', 'database', 'sqlite_schema.sql');
    if (fs.existsSync(schemaPath)) {
        const schema = fs.readFileSync(schemaPath, 'utf-8');
        // Split by semicolons and execute each statement
        const statements = schema.split(';').filter(s => s.trim());
        for (const stmt of statements) {
            try {
                db.exec(stmt);
            } catch (err) {
                // Ignore "already exists" errors
                if (!err.message.includes('already exists')) {
                    console.error('Schema error:', err.message);
                }
            }
        }
        console.log('📦 SQLite database initialized at:', DB_PATH);
    } else {
        console.error('⚠️  Schema file not found at:', schemaPath);
    }
}

initializeDatabase();

module.exports = db;
