const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'taskflow.db');
const db = new Database(dbPath, { readonly: true });

const tables = [
  'users',
  'teams',
  'team_members',
  'tasks',
  'meetings',
  'notes',
  'notifications',
  'activities'
];

console.log('\n=============================================================');
console.log('                 TASKFLOW DATABASE TABLES');
console.log('=============================================================\n');

tables.forEach(tableName => {
  try {
    const rows = db.prepare(`SELECT * FROM ${tableName}`).all();
    console.log(`\n--- TABLE: ${tableName.toUpperCase()} (${rows.length} rows) ---`);
    if (rows.length > 0) {
      console.table(rows);
    } else {
      console.log('(Empty)');
    }
  } catch (error) {
    console.error(`Error reading table ${tableName}:`, error.message);
  }
});

db.close();
console.log('\n=============================================================\n');
