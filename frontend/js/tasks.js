// ============================================
// Task Management (Kanban Board)
// ============================================

let allTasks = [];
let currentFilters = { status: '', priority: '', search: '' };

document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    // Add task button
    document.getElementById('addTaskBtn')?.addEventListener('click', () => openTaskModal());
    // Filter handlers
    document.getElementById('filterStatus')?.addEventListener('change', e => { currentFilters.status = e.target.value; renderBoard(); });
    document.getElementById('filterPriority')?.addEventListener('change', e => { currentFilters.priority = e.target.value; renderBoard(); });
    // Search
    const searchInput = document.getElementById('taskSearch');
    if (searchInput) searchInput.addEventListener('input', utils.debounce(e => { currentFilters.search = e.target.value.toLowerCase(); renderBoard(); }));
    // Modal close
    document.getElementById('taskModalOverlay')?.addEventListener('click', e => { if (e.target === e.currentTarget) closeTaskModal(); });
    document.getElementById('closeTaskModal')?.addEventListener('click', closeTaskModal);
    // Form submit
    document.getElementById('taskForm')?.addEventListener('submit', handleTaskSubmit);
    // Export
    document.getElementById('exportCsv')?.addEventListener('click', () => { window.open('/api/tasks/export/csv?token=' + api.getToken(), '_blank'); });
});

async function loadTasks() {
    try {
        const data = await api.get('/tasks');
        allTasks = data.tasks || [];
        renderBoard();
    } catch (err) { utils.showToast('Failed to load tasks', 'error'); }
}

function renderBoard() {
    const statuses = ['pending', 'in_progress', 'completed'];
    statuses.forEach(status => {
        const col = document.getElementById(`col-${status}`);
        if (!col) return;
        let tasks = allTasks.filter(t => t.status === status);
        // Apply filters
        if (currentFilters.priority) tasks = tasks.filter(t => t.priority === currentFilters.priority);
        if (currentFilters.search) tasks = tasks.filter(t => t.title.toLowerCase().includes(currentFilters.search) || (t.description || '').toLowerCase().includes(currentFilters.search));
        // Update count
        const countEl = col.closest('.board-column')?.querySelector('.column-count');
        if (countEl) countEl.textContent = tasks.length;
        // Render cards
        col.innerHTML = tasks.length ? tasks.map(t => renderTaskCard(t)).join('') : '<div class="empty-state"><p style="padding:2rem">No tasks here</p></div>';
        // Setup drag events
        setupDragAndDrop(col, status);
    });
}

function renderTaskCard(t) {
    const tags = t.tags ? t.tags.split(',').map(tag => `<span class="task-tag">${utils.escapeHtml(tag.trim())}</span>`).join('') : '';
    const overdue = utils.isOverdue(t.due_date) && t.status !== 'completed';
    return `
    <div class="task-card" draggable="true" data-id="${t.id}" ondragstart="onDragStart(event, ${t.id})">
        <div class="task-card-header">
            <span class="task-card-title">${utils.escapeHtml(t.title)}</span>
            <div class="task-card-actions">
                <button onclick="openTaskModal(${t.id})" title="Edit">✏️</button>
                <button class="delete-btn" onclick="deleteTask(${t.id})" title="Delete">🗑️</button>
            </div>
        </div>
        ${t.description ? `<div class="task-card-desc">${utils.escapeHtml(t.description)}</div>` : ''}
        <div class="task-card-meta">
            <span class="badge badge-${t.priority}">${t.priority}</span>
            ${tags ? `<div class="task-card-tags">${tags}</div>` : ''}
        </div>
        ${t.due_date ? `<div class="task-card-footer"><span class="task-card-due ${overdue ? 'overdue' : ''}">📅 ${utils.formatDate(t.due_date)}</span>${t.assigned_name ? `<div class="avatar avatar-sm" title="${utils.escapeHtml(t.assigned_name)}">${utils.getInitials(t.assigned_name)}</div>` : ''}</div>` : ''}
    </div>`;
}

// Drag and Drop
function onDragStart(e, id) {
    e.dataTransfer.setData('text/plain', id);
    e.target.classList.add('dragging');
}

function setupDragAndDrop(col, status) {
    col.addEventListener('dragover', e => { e.preventDefault(); col.classList.add('drag-over'); });
    col.addEventListener('dragleave', () => col.classList.remove('drag-over'));
    col.addEventListener('drop', async e => {
        e.preventDefault(); col.classList.remove('drag-over');
        const id = e.dataTransfer.getData('text/plain');
        try {
            await api.patch(`/tasks/${id}/status`, { status });
            const task = allTasks.find(t => t.id == id);
            if (task) task.status = status;
            renderBoard();
            utils.showToast('Task moved!', 'success');
        } catch (err) { utils.showToast('Failed to move task', 'error'); }
    });
}

// Modal
function openTaskModal(id = null) {
    const overlay = document.getElementById('taskModalOverlay');
    const title = document.getElementById('modalTitle');
    const form = document.getElementById('taskForm');
    form.reset();
    document.getElementById('taskId').value = '';

    if (id) {
        const t = allTasks.find(task => task.id === id);
        if (t) {
            title.textContent = 'Edit Task';
            document.getElementById('taskId').value = t.id;
            document.getElementById('taskTitle').value = t.title;
            document.getElementById('taskDesc').value = t.description || '';
            document.getElementById('taskPriority').value = t.priority;
            document.getElementById('taskStatus').value = t.status;
            document.getElementById('taskDue').value = t.due_date ? t.due_date.split('T')[0] : '';
            document.getElementById('taskTags').value = t.tags || '';
        }
    } else { title.textContent = 'New Task'; }
    overlay.classList.add('active');
}

function closeTaskModal() {
    document.getElementById('taskModalOverlay')?.classList.remove('active');
}

async function handleTaskSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('taskId').value;
    const body = {
        title: document.getElementById('taskTitle').value,
        description: document.getElementById('taskDesc').value,
        priority: document.getElementById('taskPriority').value,
        status: document.getElementById('taskStatus').value,
        due_date: document.getElementById('taskDue').value || null,
        tags: document.getElementById('taskTags').value
    };
    try {
        if (id) { await api.put(`/tasks/${id}`, body); utils.showToast('Task updated!', 'success'); }
        else { await api.post('/tasks', body); utils.showToast('Task created!', 'success'); }
        closeTaskModal();
        await loadTasks();
    } catch (err) { utils.showToast(err.message, 'error'); }
}

async function deleteTask(id) {
    if (!confirm('Delete this task?')) return;
    try {
        await api.delete(`/tasks/${id}`);
        allTasks = allTasks.filter(t => t.id !== id);
        renderBoard();
        utils.showToast('Task deleted', 'success');
    } catch (err) { utils.showToast('Failed to delete', 'error'); }
}
