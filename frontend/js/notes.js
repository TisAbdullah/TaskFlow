// ============================================
// Notes Module
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    loadNotes();
    document.getElementById('addNoteBtn')?.addEventListener('click', () => openNoteModal());
    document.getElementById('noteModalOverlay')?.addEventListener('click', e => { if (e.target === e.currentTarget) closeNoteModal(); });
    document.getElementById('closeNoteModal')?.addEventListener('click', closeNoteModal);
    document.getElementById('noteForm')?.addEventListener('submit', handleNoteSubmit);
});

async function loadNotes() {
    try {
        const notes = await api.get('/notes');
        renderNotes(notes);
    } catch (err) { utils.showToast('Failed to load notes', 'error'); }
}

function renderNotes(notes) {
    const container = document.getElementById('notesGrid');
    if (!container) return;
    if (!notes.length) { container.innerHTML = '<div class="empty-state"><h3>No notes yet</h3><p>Create your first note!</p></div>'; return; }
    container.innerHTML = notes.map(n => `
        <div class="note-card ${n.is_pinned ? 'pinned' : ''}">
            <span class="note-pin" onclick="togglePin(${n.id})" title="${n.is_pinned ? 'Unpin' : 'Pin'}">${n.is_pinned ? '📌' : '📍'}</span>
            <h3>${utils.escapeHtml(n.title)}</h3>
            <div class="note-content">${utils.escapeHtml(n.content || '')}</div>
            <div class="note-date">${utils.formatDate(n.updated_at)}</div>
            <div class="note-actions">
                <button class="btn btn-sm btn-secondary" onclick="editNote(${n.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteNote(${n.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

function openNoteModal(n = null) {
    const form = document.getElementById('noteForm');
    form.reset();
    document.getElementById('noteId').value = '';
    document.getElementById('noteModalTitle').textContent = n ? 'Edit Note' : 'New Note';
    if (n) {
        document.getElementById('noteId').value = n.id;
        document.getElementById('noteTitle').value = n.title;
        document.getElementById('noteContent').value = n.content || '';
    }
    document.getElementById('noteModalOverlay').classList.add('active');
}
function closeNoteModal() { document.getElementById('noteModalOverlay')?.classList.remove('active'); }

async function handleNoteSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('noteId').value;
    const body = { title: document.getElementById('noteTitle').value, content: document.getElementById('noteContent').value };
    try {
        if (id) { await api.put(`/notes/${id}`, body); } else { await api.post('/notes', body); }
        closeNoteModal(); loadNotes();
        utils.showToast(id ? 'Note updated!' : 'Note created!', 'success');
    } catch (err) { utils.showToast(err.message, 'error'); }
}

async function deleteNote(id) {
    if (!confirm('Delete this note?')) return;
    try { await api.delete(`/notes/${id}`); loadNotes(); utils.showToast('Note deleted', 'success'); }
    catch (err) { utils.showToast('Failed to delete', 'error'); }
}

async function togglePin(id) {
    try { await api.patch(`/notes/${id}/pin`); loadNotes(); } catch (e) {}
}

async function editNote(id) {
    try {
        const notes = await api.get('/notes');
        const n = notes.find(x => x.id === id);
        if (n) openNoteModal(n);
    } catch (e) {}
}
