// ============================================
// Meetings Module
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    loadMeetings();
    document.getElementById('addMeetingBtn')?.addEventListener('click', () => openMeetingModal());
    document.getElementById('meetingModalOverlay')?.addEventListener('click', e => { if (e.target === e.currentTarget) closeMeetingModal(); });
    document.getElementById('closeMeetingModal')?.addEventListener('click', closeMeetingModal);
    document.getElementById('meetingForm')?.addEventListener('submit', handleMeetingSubmit);
});

async function loadMeetings() {
    try {
        const meetings = await api.get('/meetings');
        renderMeetings(meetings);
    } catch (err) { utils.showToast('Failed to load meetings', 'error'); }
}

function renderMeetings(meetings) {
    const container = document.getElementById('meetingsGrid');
    if (!container) return;
    if (!meetings.length) { container.innerHTML = '<div class="empty-state"><h3>No meetings scheduled</h3><p>Click "Schedule Meeting" to get started</p></div>'; return; }
    const now = new Date();
    const upcoming = meetings.filter(m => new Date(m.meeting_date) >= now);
    const past = meetings.filter(m => new Date(m.meeting_date) < now);

    let html = '';
    if (upcoming.length) {
        html += '<h3 style="margin-bottom:var(--space-md);color:var(--text-primary)">Upcoming</h3><div class="meetings-grid">';
        html += upcoming.map(m => meetingCard(m)).join('');
        html += '</div>';
    }
    if (past.length) {
        html += '<h3 style="margin:var(--space-xl) 0 var(--space-md);color:var(--text-secondary)">Past Meetings</h3><div class="meetings-grid">';
        html += past.map(m => meetingCard(m, true)).join('');
        html += '</div>';
    }
    container.innerHTML = html;
}

function meetingCard(m, isPast = false) {
    return `<div class="meeting-card" style="${isPast ? 'opacity:0.6' : ''}">
        <h3>${utils.escapeHtml(m.title)}</h3>
        <div class="meeting-meta">
            <span>📅 ${utils.formatDateTime(m.meeting_date)}</span>
            <span>⏱️ ${m.duration_minutes} minutes</span>
            ${m.team_name ? `<span>👥 ${utils.escapeHtml(m.team_name)}</span>` : ''}
        </div>
        ${m.description ? `<p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:12px">${utils.escapeHtml(m.description)}</p>` : ''}
        <div class="meeting-actions">
            <button class="btn btn-sm btn-secondary" onclick="editMeeting(${m.id})">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="deleteMeeting(${m.id})">Delete</button>
        </div>
    </div>`;
}

function openMeetingModal(m = null) {
    const form = document.getElementById('meetingForm');
    form.reset();
    document.getElementById('meetingId').value = '';
    document.getElementById('meetingModalTitle').textContent = m ? 'Edit Meeting' : 'Schedule Meeting';
    if (m) {
        document.getElementById('meetingId').value = m.id;
        document.getElementById('meetingTitle').value = m.title;
        document.getElementById('meetingDesc').value = m.description || '';
        document.getElementById('meetingDate').value = m.meeting_date ? m.meeting_date.slice(0, 16) : '';
        document.getElementById('meetingDuration').value = m.duration_minutes;
    }
    document.getElementById('meetingModalOverlay').classList.add('active');
}
function closeMeetingModal() { document.getElementById('meetingModalOverlay')?.classList.remove('active'); }

async function handleMeetingSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('meetingId').value;
    const body = {
        title: document.getElementById('meetingTitle').value,
        description: document.getElementById('meetingDesc').value,
        meeting_date: document.getElementById('meetingDate').value,
        duration_minutes: parseInt(document.getElementById('meetingDuration').value) || 30
    };
    try {
        if (id) { await api.put(`/meetings/${id}`, body); } else { await api.post('/meetings', body); }
        closeMeetingModal();
        loadMeetings();
        utils.showToast(id ? 'Meeting updated!' : 'Meeting scheduled!', 'success');
    } catch (err) { utils.showToast(err.message, 'error'); }
}

async function deleteMeeting(id) {
    if (!confirm('Delete this meeting?')) return;
    try { await api.delete(`/meetings/${id}`); loadMeetings(); utils.showToast('Meeting deleted', 'success'); }
    catch (err) { utils.showToast('Failed to delete', 'error'); }
}

async function editMeeting(id) {
    try {
        const meetings = await api.get('/meetings');
        const m = meetings.find(x => x.id === id);
        if (m) openMeetingModal(m);
    } catch (e) {}
}
