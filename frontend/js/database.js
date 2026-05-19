// Database Admin Frontend Logic

document.addEventListener('DOMContentLoaded', () => {
    const tableListEl = document.getElementById('tableList');
    const dataContainerEl = document.getElementById('dataContainer');
    const currentTableNameEl = document.getElementById('currentTableName');
    const refreshBtn = document.getElementById('refreshBtn');
    const saveStatusEl = document.getElementById('saveStatus');
    const customQueryInput = document.getElementById('customQueryInput');
    const runQueryBtn = document.getElementById('runQueryBtn');

    let currentTable = null;
    let tableDataCache = [];

    // Initialize
    loadTables();

    // Event Listeners
    refreshBtn.addEventListener('click', () => {
        if (currentTable) loadTableData(currentTable);
    });

    runQueryBtn.addEventListener('click', runCustomQuery);

    // Fetch tables
    async function loadTables() {
        try {
            const response = await api.get('/database/tables');
            if (response.success) {
                tableListEl.innerHTML = '';
                response.tables.forEach(tableName => {
                    const li = document.createElement('li');
                    li.className = 'db-table-item';
                    li.textContent = tableName;
                    li.onclick = () => selectTable(tableName, li);
                    tableListEl.appendChild(li);
                });
            }
        } catch (error) {
            console.error('Failed to load tables:', error);
            tableListEl.innerHTML = `<div style="padding: 15px; color: var(--danger-color)">Error loading tables</div>`;
        }
    }

    // Select a table
    function selectTable(tableName, element) {
        // Update active state
        document.querySelectorAll('.db-table-item').forEach(el => el.classList.remove('active'));
        if (element) element.classList.add('active');

        currentTable = tableName;
        currentTableNameEl.textContent = tableName;
        refreshBtn.disabled = false;
        
        loadTableData(tableName);
    }

    // Load data for a specific table
    async function loadTableData(tableName) {
        dataContainerEl.innerHTML = '<div class="spinner" style="margin: 40px auto;"></div>';
        
        try {
            const response = await api.get(`/database/tables/${tableName}`);
            if (response.success) {
                renderTableData(tableName, response.columns, response.rows);
            }
        } catch (error) {
            console.error(`Failed to load data for ${tableName}:`, error);
            dataContainerEl.innerHTML = `<div class="db-empty-state">Error loading data</div>`;
        }
    }

    // Render the HTML table
    function renderTableData(tableName, columns, rows) {
        if (!rows || rows.length === 0) {
            dataContainerEl.innerHTML = `<div class="db-empty-state">No results found</div>`;
            return;
        }

        tableDataCache = rows; // Cache rows for referencing IDs

        const table = document.createElement('table');
        table.className = 'db-data-table';

        // Header
        const thead = document.createElement('thead');
        const trHead = document.createElement('tr');
        columns.forEach(col => {
            const th = document.createElement('th');
            th.textContent = col.name;
            trHead.appendChild(th);
        });
        thead.appendChild(trHead);
        table.appendChild(thead);

        // Body
        const tbody = document.createElement('tbody');
        rows.forEach((row, rowIndex) => {
            const tr = document.createElement('tr');
            
            columns.forEach(col => {
                const td = document.createElement('td');
                const value = row[col.name];
                
                // Only allow editing if we know the table name and row has an ID
                if (tableName !== 'Custom Query' && col.name !== 'id' && row.id !== undefined) {
                    td.className = 'editable';
                    td.textContent = value === null ? 'NULL' : value;
                    // Click to edit
                    td.onclick = () => enableEditing(td, tableName, row.id, col.name, value);
                } else {
                    td.textContent = value === null ? 'NULL' : value;
                }
                
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);

        dataContainerEl.innerHTML = '';
        dataContainerEl.appendChild(table);
    }


    // Inline editing logic
    function enableEditing(tdElement, tableName, rowId, columnName, currentValue) {
        // Prevent multiple inputs
        if (tdElement.querySelector('input')) return;

        // Create input element
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'db-cell-input';
        input.value = currentValue === null ? '' : currentValue;
        
        // Clear cell and append input
        tdElement.textContent = '';
        tdElement.appendChild(input);
        
        // Focus and select all text
        input.focus();
        input.select();

        // Handle blur (save) or Enter key
        input.onblur = () => handleSave(tdElement, input.value, currentValue, tableName, rowId, columnName);
        input.onkeydown = (e) => {
            if (e.key === 'Enter') input.blur();
            if (e.key === 'Escape') cancelEdit(tdElement, currentValue);
        };
    }

    function cancelEdit(tdElement, originalValue) {
        tdElement.textContent = originalValue === null ? 'NULL' : originalValue;
    }

    async function handleSave(tdElement, newValue, originalValue, tableName, rowId, columnName) {
        // If value didn't change, just revert UI
        if (newValue === String(originalValue || '') || (newValue === '' && originalValue === null)) {
            cancelEdit(tdElement, originalValue);
            return;
        }

        // Convert string "null" back to actual null
        const updateValue = newValue.toLowerCase() === 'null' || newValue === '' ? null : newValue;
        tdElement.innerHTML = '<span class="spinner" style="width: 12px; height: 12px;"></span>';

        try {
            const data = { [columnName]: updateValue };
            const response = await api.put(`/database/tables/${tableName}/${rowId}`, data);
            
            if (response.success) {
                tdElement.textContent = updateValue === null ? 'NULL' : updateValue;
                showSaveSuccess();
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.error('Update failed:', error);
            tdElement.textContent = originalValue === null ? 'NULL' : originalValue;
            alert('Failed to update value: ' + error.message);
        }
    }

    function showSaveSuccess() {
        saveStatusEl.style.opacity = '1';
        setTimeout(() => {
            saveStatusEl.style.opacity = '0';
        }, 2000);
    }

    // Custom query logic
    async function runCustomQuery() {
        const query = customQueryInput.value.trim();
        if (!query) return;

        // Deselect tables
        document.querySelectorAll('.db-table-item').forEach(el => el.classList.remove('active'));
        currentTable = null;
        currentTableNameEl.textContent = 'Custom Query Results';
        refreshBtn.disabled = true;
        
        dataContainerEl.innerHTML = '<div class="spinner" style="margin: 40px auto;"></div>';

        try {
            const response = await api.post('/database/query', { query });
            
            if (response.success) {
                if (response.rows) {
                    // It was a SELECT query
                    renderTableData('Custom Query', response.columns, response.rows);
                } else {
                    // It was an UPDATE/INSERT/DELETE query
                    dataContainerEl.innerHTML = `
                        <div style="padding: 20px; color: var(--success-color);">
                            <h3>Success</h3>
                            <p>${response.message}</p>
                        </div>
                    `;
                }
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.error('Custom query failed:', error);
            dataContainerEl.innerHTML = `
                <div style="padding: 20px; color: var(--danger-color);">
                    <h3>Query Error</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }
});
