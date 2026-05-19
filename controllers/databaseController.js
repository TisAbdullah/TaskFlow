const db = require('../config/db');

// Get all non-system tables
exports.getTables = (req, res) => {
    try {
        const query = "SELECT name FROM sqlite_schema WHERE type='table' AND name NOT LIKE 'sqlite_%'";
        const tables = db.prepare(query).all();
        res.json({ success: true, tables: tables.map(t => t.name) });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Get all rows for a specific table
exports.getTableData = (req, res) => {
    try {
        const { name } = req.params;
        // Validate table name to prevent SQL injection
        const isValidTable = db.prepare("SELECT name FROM sqlite_schema WHERE type='table' AND name = ?").get(name);
        
        if (!isValidTable) {
            return res.status(404).json({ success: false, error: 'Table not found' });
        }

        // Get table info (columns)
        const columns = db.prepare(`PRAGMA table_info(${name})`).all();
        
        // Get rows
        const rows = db.prepare(`SELECT * FROM ${name}`).all();
        
        res.json({ success: true, columns, rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Update a row in a specific table
exports.updateRow = (req, res) => {
    try {
        const { name, id } = req.params;
        const data = req.body; // Key-value pairs to update

        // Validate table name
        const isValidTable = db.prepare("SELECT name FROM sqlite_schema WHERE type='table' AND name = ?").get(name);
        
        if (!isValidTable) {
            return res.status(404).json({ success: false, error: 'Table not found' });
        }

        // We only want to update provided fields
        const keys = Object.keys(data);
        if (keys.length === 0) {
            return res.status(400).json({ success: false, error: 'No data provided to update' });
        }

        // Generate SET clause: "col1 = @col1, col2 = @col2"
        const setClause = keys.map(k => `${k} = @${k}`).join(', ');
        
        // Add updated_at if the table has it, but first check if it does
        const columnsInfo = db.prepare(`PRAGMA table_info(${name})`).all();
        const hasUpdatedAt = columnsInfo.some(c => c.name === 'updated_at');
        
        let finalSetClause = setClause;
        if (hasUpdatedAt && !data.updated_at) {
            finalSetClause += `, updated_at = datetime('now')`;
        }

        const query = `UPDATE ${name} SET ${finalSetClause} WHERE id = @id`;
        
        const info = db.prepare(query).run({ ...data, id });
        
        if (info.changes === 0) {
            return res.status(404).json({ success: false, error: 'Record not found or no changes made' });
        }

        res.json({ success: true, message: 'Row updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Execute custom raw SQL query
exports.executeCustomQuery = (req, res) => {
    try {
        const { query } = req.body;
        
        if (!query || query.trim() === '') {
            return res.status(400).json({ success: false, error: 'Query is required' });
        }

        // Determine if it's a read (SELECT) or write (INSERT/UPDATE/DELETE) query
        const isSelect = query.trim().toUpperCase().startsWith('SELECT') || query.trim().toUpperCase().startsWith('PRAGMA');
        
        if (isSelect) {
            const rows = db.prepare(query).all();
            
            // Extract columns from the first row if available
            let columns = [];
            if (rows.length > 0) {
                columns = Object.keys(rows[0]).map(key => ({ name: key }));
            }
            
            res.json({ success: true, columns, rows });
        } else {
            const info = db.prepare(query).run();
            res.json({ 
                success: true, 
                message: `Query executed successfully. Changes: ${info.changes}`,
                changes: info.changes
            });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
