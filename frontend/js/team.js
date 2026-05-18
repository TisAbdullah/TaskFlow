// ============================================
// Team Management Module
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    loadTeams();
    document.getElementById('createTeamBtn')?.addEventListener('click', () => openTeamModal());
    document.getElementById('teamModalOverlay')?.addEventListener('click', e => { if (e.target === e.currentTarget) closeTeamModal(); });
    document.getElementById('closeTeamModal')?.addEventListener('click', closeTeamModal);
    document.getElementById('teamForm')?.addEventListener('submit', handleTeamSubmit);
    document.getElementById('addMemberForm')?.addEventListener('submit', handleAddMember);
});

async function loadTeams() {
    try {
        const teams = await api.get('/teams');
        renderTeams(teams);
    } catch (err) { utils.showToast('Failed to load teams', 'error'); }
}

function renderTeams(teams) {
    const container = document.getElementById('teamsContainer');
    if (!container) return;
    if (!teams.length) { container.innerHTML = '<div class="empty-state"><h3>No teams yet</h3><p>Create a team to collaborate!</p></div>'; return; }
    container.innerHTML = teams.map(t => `
        <div class="team-card" data-team-id="${t.id}">
            <div class="team-card-header">
                <div><h3>${utils.escapeHtml(t.name)}</h3><p class="text-sm text-muted">${t.member_count || 0} members</p></div>
                <button class="btn btn-sm btn-primary" onclick="showAddMember(${t.id})">+ Add Member</button>
            </div>
            ${t.description ? `<p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:var(--space-md)">${utils.escapeHtml(t.description)}</p>` : ''}
            <div class="members-grid" id="members-${t.id}"><div class="spinner" style="margin:20px auto"></div></div>
        </div>
    `).join('');
    // Load members for each team
    teams.forEach(t => loadMembers(t.id));
}

async function loadMembers(teamId) {
    try {
        const members = await api.get(`/teams/${teamId}/members`);
        const container = document.getElementById(`members-${teamId}`);
        if (!container) return;
        container.innerHTML = members.map(m => `
            <div class="member-card">
                <div class="avatar" style="background:${utils.avatarColor(m.name)}">${utils.getInitials(m.name)}</div>
                <div class="member-info">
                    <h4>${utils.escapeHtml(m.name)}</h4>
                    <p>${utils.escapeHtml(m.email)}</p>
                    <p style="font-size:0.75rem;color:var(--text-muted)">${m.task_count || 0} tasks</p>
                </div>
                <span class="member-role">${m.role}</span>
            </div>
        `).join('');
    } catch (e) {}
}

function openTeamModal() {
    document.getElementById('teamForm')?.reset();
    document.getElementById('teamModalOverlay')?.classList.add('active');
}
function closeTeamModal() { document.getElementById('teamModalOverlay')?.classList.remove('active'); }

async function handleTeamSubmit(e) {
    e.preventDefault();
    const body = { name: document.getElementById('teamName').value, description: document.getElementById('teamDesc').value };
    try { await api.post('/teams', body); closeTeamModal(); loadTeams(); utils.showToast('Team created!', 'success'); }
    catch (err) { utils.showToast(err.message, 'error'); }
}

let selectedTeamId = null;
function showAddMember(teamId) {
    selectedTeamId = teamId;
    document.getElementById('addMemberOverlay')?.classList.add('active');
    loadAvailableUsers();
}

async function loadAvailableUsers() {
    try {
        const users = await api.get('/teams/users');
        const select = document.getElementById('memberSelect');
        if (select) select.innerHTML = users.map(u => `<option value="${u.id}">${u.name} (${u.email})</option>`).join('');
    } catch (e) {}
}

async function handleAddMember(e) {
    e.preventDefault();
    const userId = document.getElementById('memberSelect').value;
    const role = document.getElementById('memberRole').value;
    try {
        await api.post(`/teams/${selectedTeamId}/members`, { user_id: parseInt(userId), role });
        document.getElementById('addMemberOverlay')?.classList.remove('active');
        loadTeams();
        utils.showToast('Member added!', 'success');
    } catch (err) { utils.showToast(err.message, 'error'); }
}
